import { useQuery } from "@tanstack/react-query";
import { RefreshControl, Text, View } from "react-native";
import { portalApi } from "@/api/services";
import { Card, EmptyState, ErrorState, LoadingBlock, Screen, SectionTitle, StatCard } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme";

export default function FinanceScreen() {
  const user = useAuthStore((state) => state.user);
  const selectedChildId = useAuthStore((state) => state.selectedChildId);

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", user?.role, "finance"],
    queryFn: () => portalApi.getDashboard(user!.role),
    enabled: !!user
  });

  const studentId =
    user?.role === "STUDENT"
      ? user.linkedStudentId ?? null
      : user?.role === "PARENT"
        ? selectedChildId ?? dashboardQuery.data?.children?.[0]?.id ?? null
        : null;

  const invoicesQuery = useQuery({
    queryKey: ["invoices", studentId],
    queryFn: () => portalApi.getInvoices(studentId!),
    enabled: !!studentId
  });

  const paymentsQuery = useQuery({
    queryKey: ["payments", studentId],
    queryFn: () => portalApi.getPayments(studentId!),
    enabled: !!studentId
  });

  if (!user) {
    return null;
  }

  if (dashboardQuery.isLoading || invoicesQuery.isLoading || paymentsQuery.isLoading) {
    return <Screen title="Finance"><LoadingBlock /></Screen>;
  }

  if (dashboardQuery.isError || invoicesQuery.isError || paymentsQuery.isError || !dashboardQuery.data) {
    return <Screen title="Finance"><ErrorState title="Finance unavailable" message="The app could not load fee data from the school backend." onRetry={() => { void dashboardQuery.refetch(); void invoicesQuery.refetch(); void paymentsQuery.refetch(); }} /></Screen>;
  }

  const feeBalance =
    user.role === "PARENT"
      ? dashboardQuery.data.children?.find((child) => child.id === studentId)?.feeBalance?.total_balance ?? 0
      : dashboardQuery.data.feeBalance?.total_balance ?? 0;

  const invoices = invoicesQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];

  return (
    <Screen title="Finance" subtitle="This mobile screen is read-only for fees, invoices, payments, and balances." refreshControl={<RefreshControl refreshing={dashboardQuery.isRefetching || invoicesQuery.isRefetching || paymentsQuery.isRefetching} onRefresh={() => { void dashboardQuery.refetch(); void invoicesQuery.refetch(); void paymentsQuery.refetch(); }} />}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <StatCard label="Balance" value={String(feeBalance)} icon="account-balance-wallet" />
        <StatCard label="Payments" value={String(payments.length)} icon="payments" accent={colors.secondary} />
      </View>

      <Card>
        <SectionTitle title="Invoices" />
        {invoices.length ? invoices.map((item, index) => (
          <View key={String(item.id ?? index)} style={{ paddingVertical: 10 }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>{String(item.invoice_number ?? `Invoice ${item.id ?? index + 1}`)}</Text>
            <Text style={{ color: colors.muted }}>Amount: {String(item.final_amount ?? item.total_amount ?? 0)} • Status: {String(item.status ?? "UNPAID")}</Text>
          </View>
        )) : <EmptyState title="No invoices" message="No invoice records were returned for this student." />}
      </Card>

      <Card>
        <SectionTitle title="Payment History" />
        {payments.length ? payments.map((item, index) => (
          <View key={String(item.id ?? index)} style={{ paddingVertical: 10 }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>{String(item.receipt_number ?? `Receipt ${item.id ?? index + 1}`)}</Text>
            <Text style={{ color: colors.muted }}>Amount: {String(item.amount ?? 0)} • Date: {String(item.payment_date ?? "-").slice(0, 10)}</Text>
          </View>
        )) : <EmptyState title="No payments" message="No payment history was returned for this student." />}
      </Card>
    </Screen>
  );
}
