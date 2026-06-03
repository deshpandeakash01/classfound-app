// app/(tabs)/approvals.jsx

import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCallback, useEffect, useRef, useState } from "react";

import { supabase } from "../../supabase";
import { useUser } from "../../UserContext";

import {
  getPendingBookings,
  updateBookingStatus,
  getCurrentUserProfile,
} from "../../services/bookingService";

// ======================================================
// Helpers
// ======================================================

function formatBookingDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRoleBadgeColor(role) {
  switch (role) {
    case "faculty":
      return "#1D5B43";

    case "cr":
      return "#8A6412";

    case "admin":
      return "#5A3E9E";

    default:
      return "#4A4A4A";
  }
}

// ======================================================
// Skeleton
// ======================================================

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeletonCard,
        {
          opacity,
        },
      ]}>
      <View style={styles.skeletonLarge} />
      <View style={styles.skeletonMedium} />
      <View style={styles.skeletonSmall} />
    </Animated.View>
  );
}

// ======================================================
// Request Card
// ======================================================

function RequestCard({
  item,
  activeTab,
  processingId,
  onAction,
  highlightedId,
  currentRole,
}) {
  const roleColor = getRoleBadgeColor(item.booker?.role);

  // ====================================================
  // Highlight animation for realtime inserts
  // ====================================================

  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (highlightedId === item.id) {
      Animated.sequence([
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),

        Animated.timing(borderAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [highlightedId]);

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#223A5E", "#C9A84C"],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          borderColor: animatedBorderColor,
        },
      ]}>
      {/* Header */}

      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.emailText}>{item.booker?.full_name}</Text>

          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: roleColor,
              },
            ]}>
            <Text style={styles.roleBadgeText}>{item.booker?.role}</Text>
          </View>
        </View>
      </View>

      {/* Room */}

      <Text style={styles.roomTitle}>{item.rooms?.room_name}</Text>

      <Text style={styles.blockText}>{item.rooms?.block_name}</Text>

      {/* Date */}

      <Text style={styles.metaText}>
        {formatBookingDate(item.booking_date)}
      </Text>

      {/* Time */}

      <Text style={styles.metaText}>
        {item.start_time?.slice(0, 5)} – {item.end_time?.slice(0, 5)}
      </Text>

      {/* Section */}

      {item.section_name ? (
        <Text style={styles.sectionText}>Section: {item.section_name}</Text>
      ) : null}

      {/* Assigned Faculty */}
      {item.assigned && (
        <Text style={styles.sectionText}>
          Faculty: {item.assigned.full_name}
        </Text>
      )}

      {/* Purpose */}

      <Text style={styles.purposeText}>{item.purpose}</Text>

      {/* Actions */}

      {activeTab === "pending" && currentRole !== "cr" && (
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, styles.approveButton]}
            disabled={processingId === item.id}
            onPress={() => onAction(item.id, "approved")}>
            {processingId === item.id ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.actionText}>✓ Approve</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.rejectButton]}
            disabled={processingId === item.id}
            onPress={() => onAction(item.id, "rejected")}>
            {processingId === item.id ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.actionText}>✗ Reject</Text>
            )}
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

// ======================================================
// Screen
// ======================================================

export default function ApprovalsScreen() {
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState("pending");

  const [pendingRequests, setPendingRequests] = useState([]);

  const [allRequests, setAllRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [processingId, setProcessingId] = useState(null);

  const [highlightedId, setHighlightedId] = useState(null);

  // ====================================================
  // Access guard
  // ====================================================

  const hasAccess =
    user?.role === "faculty" || user?.role === "admin" || user?.role === "cr";

  // ====================================================
  // Fetch pending
  // ====================================================

  const fetchPending = useCallback(async () => {
    const data = await getPendingBookings();

    setPendingRequests(data || []);
  }, []);

  // ====================================================
  // Fetch all requests
  // ====================================================

  const fetchAllRequests = useCallback(async () => {
    const { user, profile } = await getCurrentUserProfile();

    let query = supabase
      .from("bookings")
      .select(
        `
      id,
      booking_date,
      start_time,
      end_time,
      purpose,
      status,
      section_name,
      created_at,
      assigned_faculty,

      rooms (
        room_name,
        block_name
      ),

      booker:profiles!bookings_booked_by_fkey (
        full_name,
        email,
        role
      ),
      
      assigned:profiles!bookings_assigned_faculty_fkey (
        full_name,
        email
      )
    `,
      )
      .neq("status", "pending");

    if (profile.role === "faculty") {
      query = query.eq("assigned_faculty", user.id);
    } else if (profile.role === "cr") {
      query = query.eq("booked_by", user.id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    setAllRequests(data || []);
  }, []);

  // ====================================================
  // Initial load
  // ====================================================
  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!hasAccess) return;

    let timeout;

    const channel = supabase
      .channel("pending-bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
        },
        async (payload) => {
          try {
            const newBooking = payload.new;

            if (newBooking.status !== "pending") {
              return;
            }
            if (
              user?.role === "faculty" &&
              newBooking.assigned_faculty !== user.id
            ) {
              return;
            }
            if (user?.role === "cr" && newBooking.booked_by !== user.id) {
              return;
            }

            // Fetch full joined record
            const { data, error } = await supabase
              .from("bookings")
              .select(
                `
              id,
              booking_date,
              start_time,
              end_time,
              purpose,
              status,
              section_name,
              created_at,
              rooms (
                room_name,
                block_name
              ),
              booker:profiles!bookings_booked_by_fkey (
                full_name,
                email,
                role
              ),
              assigned:profiles!bookings_assigned_faculty_fkey (
                full_name,
                email
              )
            `,
              )
              .eq("id", newBooking.id)
              .single();

            if (error) {
              throw error;
            }

            setPendingRequests((prev) => {
              const exists = prev.some((item) => item.id === data.id);

              if (exists) {
                return prev;
              }

              return [data, ...prev];
            });

            setHighlightedId(data.id);

            timeout = setTimeout(() => {
              setHighlightedId(null);
            }, 1500);
          } catch (error) {
            console.log("Realtime insert error:", error.message);
          }
        },
      )
      .subscribe();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      supabase.removeChannel(channel);
    };
  }, [hasAccess, user?.id, user?.role]);

  async function loadData() {
    try {
      setLoading(true);

      if (activeTab === "pending") {
        await fetchPending();
      } else {
        await fetchAllRequests();
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // Refresh
  // ====================================================

  async function handleRefresh() {
    try {
      setRefreshing(true);

      if (activeTab === "pending") {
        await fetchPending();
      } else {
        await fetchAllRequests();
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setRefreshing(false);
    }
  }

  // ====================================================
  // Approve / Reject
  // ====================================================

  async function handleAction(bookingId, status) {
    try {
      setProcessingId(bookingId);

      // Optimistic removal immediately

      setPendingRequests((prev) =>
        prev.filter((item) => item.id !== bookingId),
      );

      await updateBookingStatus(bookingId, status);
    } catch (error) {
      Alert.alert("Error", error.message);

      // Restore list on failure
      fetchPending();
    } finally {
      setProcessingId(null);
    }
  }

  // ====================================================
  // Access denied
  // ====================================================

  if (!hasAccess) {
    return (
      <View style={styles.deniedContainer}>
        <Text style={styles.deniedTitle}>Access Denied</Text>

        <Text style={styles.deniedText}>
          You do not have permission to view booking approvals.
        </Text>
      </View>
    );
  }

  // ====================================================
  // Current data
  // ====================================================

  const data = activeTab === "pending" ? pendingRequests : allRequests;

  // ====================================================
  // Loading
  // ====================================================

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Booking Approvals</Text>

        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Booking Approvals</Text>

      {/* =========================================== */}
      {/* Tabs */}
      {/* =========================================== */}

      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.activeTabText,
            ]}>
            Pending
          </Text>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{pendingRequests.length}</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}>
            All Requests
          </Text>
        </Pressable>
      </View>

      {/* =========================================== */}
      {/* List */}
      {/* =========================================== */}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          data.length === 0 && { flex: 1 },
        ]}
        renderItem={({ item }) => (
          <RequestCard
            item={item}
            activeTab={activeTab}
            processingId={processingId}
            onAction={handleAction}
            highlightedId={highlightedId}
            currentRole={user?.role}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#C9A84C"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {activeTab === "pending"
                ? "No pending requests"
                : "No requests found"}
            </Text>

            <Text style={styles.emptySubtitle}>
              {activeTab === "pending"
                ? "All booking requests have been reviewed."
                : "No booking records available."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ======================================================
// Styles
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingTop: 18,
    paddingHorizontal: 18,
  },

  heading: {
    color: "#111111",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
  },

  // ====================================================
  // Tabs
  // ====================================================

  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },

  tab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  activeTab: {
    backgroundColor: "#0D5C9F",
    borderColor: "#0D5C9F",
  },

  tabText: {
    color: "#333333",
    fontWeight: "600",
  },

  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  countBadge: {
    marginLeft: 8,
    backgroundColor: "#C0392B",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // ====================================================
  // Card
  // ====================================================

  card: {
    backgroundColor: "#DCEBFA",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#B8D4F0",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  cardHeader: {
    marginBottom: 14,
  },

  emailText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  roleBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  roleBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    textTransform: "capitalize",
    fontSize: 12,
  },

  roomTitle: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "700",
  },

  blockText: {
    color: "#0D5C9F",
    marginBottom: 12,
    marginTop: 2,
    fontWeight: "600",
  },

  metaText: {
    color: "#555555",
    marginBottom: 4,
  },

  sectionText: {
    color: "#0D5C9F",
    marginTop: 8,
    marginBottom: 10,
    fontWeight: "600",
  },

  purposeText: {
    color: "#333333",
    lineHeight: 22,
    marginTop: 4,
  },

  // ====================================================
  // Actions
  // ====================================================

  actionsRow: {
    flexDirection: "row",
    marginTop: 18,
  },

  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },

  approveButton: {
    backgroundColor: "#1D8F5A",
    marginRight: 8,
  },

  rejectButton: {
    backgroundColor: "#C0392B",
    marginLeft: 8,
  },

  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // ====================================================
  // Empty
  // ====================================================

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },

  emptyTitle: {
    color: "#111111",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },

  emptySubtitle: {
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 30,
  },

  // ====================================================
  // Skeleton
  // ====================================================

  skeletonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  skeletonLarge: {
    height: 24,
    width: "60%",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 14,
  },

  skeletonMedium: {
    height: 16,
    width: "40%",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 12,
  },

  skeletonSmall: {
    height: 14,
    width: "80%",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },

  // ====================================================
  // Denied
  // ====================================================

  deniedContainer: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  deniedTitle: {
    color: "#111111",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },

  deniedText: {
    color: "#666666",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },

  listContent: {
    paddingBottom: 40,
  },
});
