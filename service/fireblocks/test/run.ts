import process from "node:process";
import { getFireblocksClient } from "../src/index";

async function main() {

  try {
    const client = getFireblocksClient();
    const assetsPage = await client.blockchainsAssets.listAssets({
      pageSize: 100,
    });
    console.log("[fireblocks:test] listAssets pageSize=100 count:", assetsPage.data?.data?.length ?? 0);
    console.log("[fireblocks:test] listAssets next cursor:", assetsPage.data?.next ?? null);
  
  } catch (error) {
    const err = error as {
      message?: string;
      response?: { status?: number; data?: unknown };
      status?: number;
      data?: unknown;
    };

    console.error("[fireblocks:test] SDK call failed.");
    const status = err.response?.status ?? err.status;
    const responseBody = err.response?.data ?? err.data;

    if (status) {
      console.error("[fireblocks:test] HTTP status:", status);
    }
    if (responseBody) {
      console.error("[fireblocks:test] Response body:", responseBody);
    }
    if (err.message) {
      console.error("[fireblocks:test] Error message:", err.message);
    }

    if (status === 403) {
      console.error("[fireblocks:test] Trying fallback endpoint: workspace.getWorkspace()");
      try {
        const client = getFireblocksClient();
        const workspace = await client.workspace.getWorkspace();
        console.log("[fireblocks:test] Fallback succeeded. Workspace:", workspace.data);
        return;
      } catch (fallbackError) {
        const fallbackErr = fallbackError as {
          message?: string;
          response?: { status?: number; data?: unknown };
          status?: number;
          data?: unknown;
        };
        const fallbackStatus = fallbackErr.response?.status ?? fallbackErr.status;
        const fallbackBody = fallbackErr.response?.data ?? fallbackErr.data;
        if (fallbackStatus) {
          console.error("[fireblocks:test] Fallback HTTP status:", fallbackStatus);
        }
        if (fallbackBody) {
          console.error("[fireblocks:test] Fallback response body:", fallbackBody);
        }
        if (fallbackErr.message) {
          console.error("[fireblocks:test] Fallback error message:", fallbackErr.message);
        }
      }

      console.error("[fireblocks:test] Hint: 403 usually means API user permission or IP allowlist issue in Fireblocks console.");
    }
    process.exitCode = 1;
  }
}

void main();
