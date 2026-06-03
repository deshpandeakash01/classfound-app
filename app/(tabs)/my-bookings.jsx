// app/(tabs)/my-bookings.jsx

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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { router } from "expo-router";

import { supabase } from "../../supabase";
import { useUser } from "../../UserContext";

import {
  getMyBookings,
  updateBookingStatus,
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

function isFutureOrToday(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookingDate = new Date(dateString);
  bookingDate.setHours(0, 0, 0, 0);

  return bookingDate >= today;
}

function getStatusStyle(status) {
  switch (status) {
    case "approved":
      return {
        backgroundColor: "#1D5B43",
        textColor: "#FFFFFF",
      };

    case "pending":
      return {
        backgroundColor: "#8A6412",
        textColor: "#FFFFFF",
      };

    case "rejected":
      return {
        backgroundColor: "#7A1F1F",
        textColor: "#FFFFFF",
      };

    case "cancelled":
      return {
        backgroundColor: "#4A4A4A",
        textColor: "#FFFFFF",
      };

    default:
      return {
        backgroundColor: "#4A4A4A",
        textColor: "#FFFFFF",
      };
  }
}

// ======================================================
// Skeleton Card
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

    return () => {
      animation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeletonCard,
        {
          opacity,
        },
      ]}>
      <View style={styles.skeletonLineLarge} />
      <View style={styles.skeletonLineMedium} />
      <View style={styles.skeletonLineSmall} />
    </Animated.View>
  );
}

// ======================================================
// Booking Card
// ======================================================

function BookingCard({ item, onCancel, cancellingId }) {
  const statusStyle = getStatusStyle(item.status);

  const canCancel =
    (item.status === "pending" || item.status === "approved") &&
    isFutureOrToday(item.booking_date);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.roomTitle}>{item.rooms?.room_name}</Text>

          <Text style={styles.blockText}>{item.rooms?.block_name}</Text>
        </View>

        <View
          style={[
            styles.statusChip,
            {
              backgroundColor: statusStyle.backgroundColor,
            },
          ]}>
          <Text
            style={[
              styles.statusText,
              {
                color: statusStyle.textColor,
              },
            ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.dateText}>
        {formatBookingDate(item.booking_date)}
      </Text>

      <Text style={styles.timeText}>
        {item.start_time?.slice(0, 5)} – {item.end_time?.slice(0, 5)}
      </Text>

      {item.section_name ? (
        <Text style={styles.sectionText}>Section: {item.section_name}</Text>
      ) : null}

      <Text style={styles.purposeText} numberOfLines={2}>
        {item.purpose}
      </Text>

      {canCancel && (
        <Pressable
          style={styles.cancelButton}
          onPress={() => onCancel(item)}
          disabled={cancellingId === item.id}>
          {cancellingId === item.id ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

// ======================================================
// Screen
// ======================================================

export default function MyBookingsScreen() {
  const { user, session } = useUser();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [cancellingId, setCancellingId] = useState(null);

  // ====================================================
  // Fetch bookings
  // ====================================================

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getMyBookings();

      setBookings(data || []);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "cr") {
      router.replace("/(tabs)");
    }
  }, [user]);

  useEffect(() => {
    initialLoad();
  }, []);

  async function initialLoad() {
    try {
      setLoading(true);
      await fetchBookings();
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // REALTIME SUBSCRIPTION
  // ====================================================

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel(`my-bookings-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `booked_by=eq.${session.user.id}`,
        },
        (payload) => {
          const updatedBooking = payload.new;

          setBookings((prev) =>
            prev.map((item) =>
              item.id === updatedBooking.id
                ? {
                    ...item,
                    status: updatedBooking.status,
                  }
                : item,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await fetchBookings();
    } finally {
      setRefreshing(false);
    }
  }

  function handleCancelPress(booking) {
    Alert.alert("Cancel Booking", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => confirmCancelBooking(booking.id),
      },
    ]);
  }

  async function confirmCancelBooking(bookingId) {
    try {
      setCancellingId(bookingId);

      await updateBookingStatus(bookingId, "cancelled");

      setBookings((prev) =>
        prev.map((item) =>
          item.id === bookingId
            ? {
                ...item,
                status: "cancelled",
              }
            : item,
        ),
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setCancellingId(null);
    }
  }

  const emptyComponent = useMemo(() => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.illustrationCircle}>
          <Text style={styles.illustrationText}>📅</Text>
        </View>

        <Text style={styles.emptyTitle}>No bookings yet</Text>

        <Text style={styles.emptySubtitle}>
          Your room reservations will appear here.
        </Text>

        <Pressable
          style={styles.bookButton}
          onPress={() => router.push("/(tabs)/book")}>
          <Text style={styles.bookButtonText}>Book a Room</Text>
        </Pressable>
      </View>
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>My Bookings</Text>

        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Bookings</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard
            item={item}
            onCancel={handleCancelPress}
            cancellingId={cancellingId}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          bookings.length === 0 && {
            flex: 1,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={emptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#C9A84C"
          />
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
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  heading: {
    color: "#111111",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
  },

  listContent: {
    paddingBottom: 40,
  },

  // ====================================================
  // Card
  // ====================================================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  roomTitle: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "700",
  },

  blockText: {
    color: "#0D5C9F",
    fontSize: 14,
    marginTop: 2,
    fontWeight: "600",
  },

  dateText: {
    color: "#333333",
    fontSize: 15,
    marginBottom: 6,
  },

  timeText: {
    color: "#666666",
    fontSize: 15,
    marginBottom: 10,
  },

  purposeText: {
    color: "#444444",
    lineHeight: 22,
    marginBottom: 14,
  },

  // ====================================================
  // Status
  // ====================================================

  statusChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  statusText: {
    fontWeight: "700",
    textTransform: "capitalize",
    fontSize: 12,
  },

  // ====================================================
  // Cancel
  // ====================================================

  cancelButton: {
    backgroundColor: "#C0392B",
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
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

  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EAF2FB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  illustrationText: {
    fontSize: 46,
  },

  emptyTitle: {
    color: "#111111",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },

  emptySubtitle: {
    color: "#666666",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },

  bookButton: {
    backgroundColor: "#0D5C9F",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 28,
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
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

  skeletonLineLarge: {
    height: 22,
    width: "60%",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 14,
  },

  skeletonLineMedium: {
    height: 16,
    width: "45%",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 12,
  },

  skeletonLineSmall: {
    height: 14,
    width: "80%",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
});
