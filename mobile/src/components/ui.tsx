import { MaterialIcons } from "@expo/vector-icons";
import { PropsWithChildren, ReactElement, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";
import { useAuthStore } from "@/store/auth-store";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function Screen({
  title,
  subtitle,
  actions,
  children,
  refreshControl
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  refreshControl?: ReactElement;
}>) {
  const user = useAuthStore((state) => state.user);
  const { label, isConnected } = useNetworkStatus();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={refreshControl}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>{user?.role ?? "CARTA"}</Text>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {actions}
          </View>
          <View style={styles.networkRow}>
            <View style={[styles.networkDot, { backgroundColor: isConnected ? colors.secondary : colors.warning }]} />
            <Text style={styles.networkText}>{label}</Text>
          </View>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, actionText, onPress }: { title: string; actionText?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && onPress ? (
        <Pressable onPress={onPress}>
          <Text style={styles.link}>{actionText}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function StatCard({ label, value, icon, accent = colors.primary }: { label: string; value: string; icon: keyof typeof MaterialIcons.glyphMap; accent?: string }) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statRow}>
        <View>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
        </View>
        <MaterialIcons name={icon} size={28} color={accent} />
      </View>
    </Card>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card style={styles.centerCard}>
      <MaterialIcons name="inbox" size={32} color={colors.primaryDeep} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </Card>
  );
}

export function ErrorState({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <Card style={styles.centerCard}>
      <MaterialIcons name="wifi-off" size={32} color={colors.warning} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

export function LoadingBlock() {
  return (
    <Card style={styles.centerCard}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.emptyText}>Loading real data...</Text>
    </Card>
  );
}

export function PrimaryButton({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.primaryButton, danger && { backgroundColor: colors.danger }]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flex: 1
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 120
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  headerTop: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  kicker: {
    fontSize: 11,
    color: colors.primaryDeep,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  title: {
    fontSize: 28,
    color: colors.text,
    fontWeight: "800",
    marginTop: 4
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20
  },
  networkRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  networkDot: {
    width: 10,
    height: 10,
    borderRadius: 999
  },
  networkText: {
    fontSize: 12,
    color: colors.subtle,
    fontWeight: "600"
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text
  },
  link: {
    color: colors.primaryDeep,
    fontSize: 12,
    fontWeight: "700"
  },
  statCard: {
    flex: 1
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  statValue: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4
  },
  centerCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginTop: 10
  },
  emptyText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 6
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 999
  },
  retryText: {
    color: colors.surface,
    fontWeight: "800"
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800"
  }
});
