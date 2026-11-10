import React from "react";
import { View, Image, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useMobileGetCredits, useMobileListBibliographies } from "@workspace/api-client-react";
import { useAuth, useLanguage, useResearch } from "@/lib/providers";
import { useColors } from "@/hooks/useColors";
import { Screen, Txt, Heading, Card, Button, Notice, styles } from "@/components/UI";

export default function Home() {
  const {user,ready,error,reload}=useAuth();const {t}=useLanguage();const c=useColors();const research=useResearch();
  const credits=useMobileGetCredits({query:{enabled:!!user,retry:false}});
  const library=useMobileListBibliographies({query:{enabled:!!user,retry:false}});
  return <Screen title="Academik" subtitle={t("hero_badge")}>
    {!ready?<ActivityIndicator color={c.primary}/>:null}
    <Notice message={error} error/>{error?<Button title="Réessayer" onPress={()=>void reload()} secondary/>:null}
    <View style={{gap:14,paddingVertical:16}}>
      {!user?<Image source={require("@/assets/images/icon.png")} style={{width:76,height:76,borderRadius:20,marginBottom:5}}/>:null}
      <Txt style={{fontFamily:"Inter_700Bold",fontSize:34,lineHeight:42,letterSpacing:-1}}>{user?`${t("hello")}, ${user.firstName || user.email.split("@")[0]}`:t("hero_title_1")+" "+t("hero_title_2")}</Txt>
      <Txt style={{color:c.mutedForeground,fontSize:16,lineHeight:26}}>{user?t("dashboard_subtitle"):t("hero_desc")}</Txt>
      <Button title={user?t("new_search"):t("hero_cta")} icon="arrow-right" onPress={()=>router.push(user?"/search":"/auth")} testID="home-primary"/>
      {!user?<Button title={t("create_account_link")} secondary onPress={()=>router.push({pathname:"/auth",params:{mode:"register"}})}/>:null}
    </View>
    {user?<><View style={styles.row}><View style={{flex:1}}><Card><Txt style={{color:c.mutedForeground,fontSize:12}}>{t("available_credits")}</Txt><Txt style={{fontSize:31,lineHeight:38,fontFamily:"Inter_700Bold",color:c.primary}}>{String(credits.data?.credits??"—")}</Txt><Pressable onPress={()=>router.push("/billing")}><Txt style={{color:c.primary,fontSize:13}}>{t("buy_credits")} →</Txt></Pressable></Card></View><View style={{flex:1}}><Card><Txt style={{color:c.mutedForeground,fontSize:12}}>{t("saved_searches_count")}</Txt><Txt style={{fontSize:31,lineHeight:38,fontFamily:"Inter_700Bold"}}>{library.data?.length??"—"}</Txt><Pressable onPress={()=>router.push("/library")}><Txt style={{color:c.primary,fontSize:13}}>{t("saved_searches")} →</Txt></Pressable></Card></View></View>
    <Heading>{t("saved_searches")}</Heading>{library.error?<Notice message={String(library.error.message)} error/>:null}{library.data?.slice(0,3).map((item:any)=><Pressable key={item.id} onPress={()=>{research.load(item);router.push("/search");}}><Card><Txt style={{fontFamily:"Inter_600SemiBold"}}>{item.title}</Txt><Txt style={{color:c.mutedForeground,fontSize:12}}>{item.norm} · {new Date(item.createdAt).toLocaleDateString()}</Txt></Card></Pressable>)}{library.data?.length===0?<Txt style={{color:c.mutedForeground}}>{t("no_saved_desc")}</Txt>:null}</>:null}
    <Heading>{t("features_title")}</Heading>
    {[["search","feature1_title","feature1_desc"],["file-text","feature2_title","feature2_desc"],["layers","feature3_title","feature3_desc"],["git-branch","feature4_title","feature4_desc"]].map(([icon,title,desc])=><Card key={title}><View style={styles.row}><Feather name={icon as any} size={21} color={c.primary}/><Txt style={{fontFamily:"Inter_600SemiBold",flex:1}}>{t(title)}</Txt></View><Txt style={{fontSize:13,color:c.mutedForeground,lineHeight:21}}>{t(desc)}</Txt></Card>)}
    <Txt style={{fontSize:12,color:c.mutedForeground}}>{t("pricing_desc")}</Txt>
  </Screen>;
}
