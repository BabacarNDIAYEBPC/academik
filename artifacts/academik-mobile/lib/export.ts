import { Platform, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { mobileExportWord } from "@workspace/api-client-react";

export async function copyText(content: string) { await Clipboard.setStringAsync(content); }
export async function shareText(content: string) { await Share.share({ message: content }); }
export async function exportWord(title: string, content: string) {
  const response = await mobileExportWord({ title, content });
  const base64 = String(response.base64 || "");
  if (!base64) throw new Error("Export vide");
  if (Platform.OS === "web") {
    const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
    const url=URL.createObjectURL(new Blob([bytes],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}));
    const link=document.createElement("a");link.href=url;link.download="academik-export.docx";link.click();URL.revokeObjectURL(url);
  } else {
    const path=FileSystem.cacheDirectory+"academik-export.docx";
    await FileSystem.writeAsStringAsync(path,base64,{encoding:FileSystem.EncodingType.Base64});
    if (!await Sharing.isAvailableAsync()) throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil");
    await Sharing.shareAsync(path,{mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",UTI:"org.openxmlformats.wordprocessingml.document"});
  }
}
