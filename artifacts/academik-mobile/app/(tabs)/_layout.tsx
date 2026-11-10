import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/lib/providers";

export default function TabLayout() {
  const c=useColors();const {t}=useLanguage();
  if(Platform.OS==="ios"&&isLiquidGlassAvailable())return <NativeTabs>
    <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Icon sf="house"/><NativeTabs.Trigger.Label>Academik</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="library"><NativeTabs.Trigger.Icon sf="books.vertical"/><NativeTabs.Trigger.Label>{t("saved_searches")}</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="account"><NativeTabs.Trigger.Icon sf="person"/><NativeTabs.Trigger.Label>{t("account","Compte")}</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="search" role="search"><NativeTabs.Trigger.Icon sf="magnifyingglass"/><NativeTabs.Trigger.Label>{t("new_search")}</NativeTabs.Trigger.Label></NativeTabs.Trigger>
  </NativeTabs>;
  return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:c.primary,tabBarInactiveTintColor:c.mutedForeground,tabBarHideOnKeyboard:true,tabBarStyle:{position:"absolute",borderTopColor:c.border,backgroundColor:Platform.OS==="ios"?"transparent":c.card,...(Platform.OS==="web"?{height:84}:{})},tabBarBackground:()=>Platform.OS==="ios"?<BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill}/>:<View style={[StyleSheet.absoluteFill,{backgroundColor:c.card}]}/>}}>
    <Tabs.Screen name="index" options={{title:"Academik",tabBarIcon:({color})=><Feather name="home" color={typeof color==="string"?color:c.mutedForeground} size={22}/>}}/>
    <Tabs.Screen name="search" options={{title:t("new_search"),tabBarIcon:({color})=><Feather name="search" color={typeof color==="string"?color:c.mutedForeground} size={22}/>}}/>
    <Tabs.Screen name="library" options={{title:t("saved_searches"),tabBarIcon:({color})=><Feather name="book-open" color={typeof color==="string"?color:c.mutedForeground} size={22}/>}}/>
    <Tabs.Screen name="account" options={{title:t("account","Compte"),tabBarIcon:({color})=><Feather name="user" color={typeof color==="string"?color:c.mutedForeground} size={22}/>}}/>
  </Tabs>;
}
