import React, { useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { useMobileListBibliographies, mobileDeleteBibliography, mobileUpdateBibliography } from "@workspace/api-client-react";
import { useAuth, useLanguage, useResearch, errorMessage } from "@/lib/providers";
import { Screen, Txt, Card, Button, Field, Notice, AuthGate } from "@/components/UI";
import { useColors } from "@/hooks/useColors";
export default function Library() {
  const {user}=useAuth();const {t}=useLanguage();const research=useResearch();const c=useColors();
  const list=useMobileListBibliographies({query:{enabled:!!user,retry:false}});
  const [message,setMessage]=useState("");const [editing,setEditing]=useState<number|null>(null);const [title,setTitle]=useState("");const [busy,setBusy]=useState(false);
  const [deleting,setDeleting]=useState<number|null>(null);
  const remove=(id:number)=>{setBusy(true);void mobileDeleteBibliography(id).then(()=>{setDeleting(null);return list.refetch();}).catch(e=>setMessage(errorMessage(e))).finally(()=>setBusy(false));};
  return <Screen title={t("saved_searches")} subtitle="Academik">{!user?<AuthGate/>:<><Button title={t("new_search")} icon="plus" onPress={()=>router.push("/search")}/><Notice message={message||list.error?.message||""} error/>{list.isLoading?<Txt>{t("loading")}</Txt>:null}{list.data?.length===0?<Card><Txt>{t("no_saved_desc")}</Txt></Card>:null}{list.data?.map((item:any)=><Card key={item.id}>{deleting===item.id?<><Txt>Supprimer définitivement « {item.title} » ?</Txt><Button title="Confirmer la suppression" danger busy={busy} onPress={()=>remove(item.id)}/><Button title="Annuler" secondary disabled={busy} onPress={()=>setDeleting(null)}/></>:editing===item.id?<><Field label="Titre" value={title} onChangeText={setTitle}/><Button title="Enregistrer" busy={busy} onPress={()=>{if(!title.trim())return;setBusy(true);void mobileUpdateBibliography(item.id,{title:title.trim()}).then(()=>{setEditing(null);return list.refetch();}).catch(e=>setMessage(errorMessage(e))).finally(()=>setBusy(false));}}/><Button title="Annuler" secondary onPress={()=>setEditing(null)}/></>:<><Txt style={{fontFamily:"Inter_600SemiBold",fontSize:18}}>{item.title}</Txt><Txt style={{color:c.mutedForeground,fontSize:12}}>{item.norm} · {Array.isArray(item.sources)?item.sources.length:0} sources · {new Date(item.createdAt).toLocaleDateString()}</Txt><Button title={t("open","Ouvrir")} icon="book-open" onPress={()=>{research.load(item);router.push("/search");}}/><View style={{gap:10}}><Button title="Renommer" secondary disabled={busy} onPress={()=>{setEditing(item.id);setTitle(item.title);}}/><Button title="Supprimer" secondary disabled={busy} onPress={()=>setDeleting(item.id)}/></View></>}</Card>)}</>}</Screen>;
}
