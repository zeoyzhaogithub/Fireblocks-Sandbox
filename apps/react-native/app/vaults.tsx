import { useQuery } from "@tanstack/react-query";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchJson } from "./lib/api";

type VaultAccount = {
  id: string;
  name?: string;
  hiddenOnUI?: boolean;
  assets?: { id?: string; total?: string }[];
};

type VaultsPagedResponse = {
  accounts: VaultAccount[];
  paging?: {
    before?: string;
    after?: string;
  };
};

export default function VaultsPage() {
  const vaultsQuery = useQuery({
    queryKey: ["vaults"],
    queryFn: () => fetchJson<VaultsPagedResponse>("/fireblocks/vaults?limit=100"),
  });

  if (vaultsQuery.isPending) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading vaults...</Text>
      </SafeAreaView>
    );
  }

  if (vaultsQuery.isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Failed: {String(vaultsQuery.error.message)}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Vault Accounts ({vaultsQuery.data.accounts.length})</Text>
      <Text style={styles.description}>after: {vaultsQuery.data.paging?.after ?? "none"}</Text>
      <ScrollView>
        {vaultsQuery.data.accounts.map((account) => (
          <View key={account.id} style={styles.card}>
            <Text style={styles.id}>{account.id}</Text>
            <Text>name: {account.name ?? "-"}</Text>
            <Text>hiddenOnUI: {String(Boolean(account.hiddenOnUI))}</Text>
            <Text>asset count: {account.assets?.length ?? 0}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  description: {
    color: "#666",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 2,
  },
  id: {
    fontWeight: "600",
  },
  error: {
    color: "#b91c1c",
  },
});
