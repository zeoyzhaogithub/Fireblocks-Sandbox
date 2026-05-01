import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { fetchJson } from "./lib/api";

type TransactionResponse = {
  id?: string;
  externalId?: string;
  status?: string;
  subStatus?: string;
  assetId?: string;
  amount?: string;
  createdAt?: number;
};

export default function TransactionPage() {
  const [txId, setTxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransactionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSearch() {
    if (!txId.trim()) {
      setError("Please input txId.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const data = await fetchJson<TransactionResponse>(
        `/fireblocks/transactions/${encodeURIComponent(txId.trim())}`,
      );
      setResult(data);
    } catch (err) {
      setError(String((err as Error).message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Transaction Query</Text>
      <TextInput
        value={txId}
        onChangeText={setTxId}
        placeholder="Input Fireblocks txId"
        style={styles.input}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={onSearch} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Query"}</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {result ? (
        <ScrollView style={styles.result}>
          <Text>id: {result.id ?? "-"}</Text>
          <Text>externalId: {result.externalId ?? "-"}</Text>
          <Text>status: {result.status ?? "-"}</Text>
          <Text>subStatus: {result.subStatus ?? "-"}</Text>
          <Text>assetId: {result.assetId ?? "-"}</Text>
          <Text>amount: {result.amount ?? "-"}</Text>
          <Text>createdAt: {result.createdAt ?? "-"}</Text>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    color: "#b91c1c",
  },
  result: {
    marginTop: 8,
  },
});
