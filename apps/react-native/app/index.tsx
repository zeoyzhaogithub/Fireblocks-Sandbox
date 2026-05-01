import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomePage() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Fireblocks Sandbox Console</Text>
      <Text style={styles.description}>MVP data pages from provider API</Text>

      <View style={styles.links}>
        <Link href="/assets" style={styles.link}>
          Assets List
        </Link>
        <Link href="/vaults" style={styles.link}>
          Vaults List
        </Link>
        <Link href="/transaction" style={styles.link}>
          Transaction Query
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  description: {
    color: "#666",
  },
  links: {
    marginTop: 16,
    gap: 12,
  },
  link: {
    fontSize: 18,
    color: "#2563eb",
  },
});
