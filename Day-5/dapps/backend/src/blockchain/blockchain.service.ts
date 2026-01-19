import { Injectable } from "@nestjs/common";
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import SIMPLE_STORAGE from "./simple-storage.json";
import {
  ServiceUnavailableException,
  InternalServerErrorException,
} from "@nestjs/common";


@Injectable()
export class BlockchainService {
  private client;
  private contractAddress: `0x${string}`;
  private abi; // ⬅️ TAMBAH (tanpa ubah struktur)

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http("https://api.avax-test.network/ext/bc/C/rpc"),
    });

    // GANTI dengan address hasil deploy Day 2
    this.contractAddress =
      "0xbb9C82ad2c810AdBC1123412E39f1a5d45B3b587" as `0x${string}`;

    // ✅ INI KUNCI UTAMANYA
    this.abi = SIMPLE_STORAGE.abi;
  }

  // 🔹 Read latest value
  async getLatestValue() {
    try {
    const value = await this.client.readContract({
      address: this.contractAddress,
      abi: this.abi, // ✅ pakai abi yang sudah pasti array
      functionName: "getValue",
    });

    return {
      value: value.toString(),
    };
  }catch (error) {
   this.handleRpcError(error);
  }
  }

  // 🔹 Read ValueUpdated events
  async getValueUpdatedEvents(fromBlock: number, toBlock: number) {
    try {
    // sebelum eksekusi logic pastikan (toBlock - fromBlock) < 2048
    // jika lebih besar, kembalikan error ke client
    
    const events = await this.client.getLogs({
      address: this.contractAddress,
      event: {
        type: "event",
        name: "ValueUpdated",
        inputs: [
          {
            name: "newValue",
            type: "uint256",
            indexed: false,
          },
        ],
      },
      fromBlock: BigInt(fromBlock),
      toBlock: BigInt(toBlock),
    });

    return events.map((event) => ({
      blockNumber: event.blockNumber?.toString(),
      value: event.args.newValue.toString(),
      txHash: event.transactionHash,
    }));
    }catch (error) {
   this.handleRpcError(error);
  }
  }

 // 🔹 Centralized RPC Error Handler
  private handleRpcError(error: any): never {
    const message = error instanceof Error ? error.message : String(error);

    console.log({ error: message });

    if (message.includes("timeout")) {
      throw new ServiceUnavailableException(
        "RPC timeout. Silakan coba beberapa saat lagi."
      );
    }

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("failed")
    ) {
      throw new ServiceUnavailableException(
        "Tidak dapat terhubung ke blockchain RPC."
      );
    }

    throw new InternalServerErrorException(
      "Terjadi kesalahan saat membaca data blockchain."
    );
  }
}