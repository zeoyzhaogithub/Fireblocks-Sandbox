import { useQuery } from "@tanstack/react-query";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchJson } from "./lib/api";

type Asset = {
  id: string;
  legacyId?: string;
  symbol?: string;
  blockchainId?: string;
};

type ListAssetsResponse = {
  data: Asset[];
  next: string | null;
};

export default function AssetsPage() {
  const assetsQuery = useQuery({
    queryKey: ["assets"],
    queryFn: () => fetchJson<ListAssetsResponse>("/fireblocks/assets?pageSize=100"),
  });

  if (assetsQuery.isPending) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading assets...</Text>
      </SafeAreaView>
    );
  }

  if (assetsQuery.isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Failed: {String(assetsQuery.error.message)}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Assets ({assetsQuery.data.data.length})</Text>
      <Text style={styles.description}>Next cursor: {assetsQuery.data.next ?? "none"}</Text>
      <ScrollView>
        {assetsQuery.data.data.map((asset) => (
          <View key={asset.id} style={styles.card}>
            <Text style={styles.id}>{asset.id}</Text>
            <Text>symbol: {asset.symbol ?? "-"}</Text>
            <Text>legacyId: {asset.legacyId ?? "-"}</Text>
            <Text>blockchainId: {asset.blockchainId ?? "-"}</Text>
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
