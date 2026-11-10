import React from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, Image, Platform, StyleSheet, type TextProps, type TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useLanguage } from "@/lib/providers";

export function Txt({ style, ...props }: TextProps) {
  const c = useColors();
  return <Text {...props} style={[{ fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 23, color: c.foreground }, style]} />;
}
export function Heading({ children }: { children: React.ReactNode }) { return <Txt style={styles.heading}>{children}</Txt>; }
export function Card({ children }: { children: React.ReactNode }) { const c = useColors(); return <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, borderRadius: c.radius }]}>{children}</View>; }
export function Button({ title, icon, onPress, busy, disabled, secondary, danger, testID }: { title: string; icon?: React.ComponentProps<typeof Feather>["name"]; onPress: () => void; busy?: boolean; disabled?: boolean; secondary?: boolean; danger?: boolean; testID?: string }) {
  const c = useColors(); const fg = secondary ? c.primary : c.primaryForeground;
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={title} disabled={busy || disabled} onPress={onPress} style={({ pressed }) => [styles.button, { borderRadius: c.radius, backgroundColor: danger ? c.destructive : secondary ? c.secondary : c.primary, opacity: disabled || busy ? 0.5 : pressed ? 0.75 : 1 }]}>{busy ? <ActivityIndicator color={fg} /> : icon ? <Feather name={icon} color={fg} size={18} /> : null}<Txt style={{ color: fg, fontFamily: "Inter_600SemiBold", flexShrink: 1 }}>{title}</Txt></Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) { const c = useColors(); return <View style={{ gap: 7 }}><Txt style={styles.label}>{label}</Txt><TextInput accessibilityLabel={label} placeholderTextColor={c.mutedForeground} {...props} style={[styles.input, { backgroundColor:c.card, borderColor:c.border, color:c.foreground, borderRadius:c.radius }, props.style]} /></View>; }
export function Chips({ options, values, onChange }: { options: [string,string][]; values: string[]; onChange: (key: string) => void }) { const c = useColors(); return <View style={styles.wrap}>{options.map(([key,title]) => <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected:values.includes(key) }} onPress={() => onChange(key)} style={[styles.chip,{backgroundColor:values.includes(key)?c.primary:c.secondary,borderRadius:c.radius}]}><Txt style={{fontSize:13,color:values.includes(key)?c.primaryForeground:c.foreground}}>{title}</Txt></Pressable>)}</View>; }
export function Notice({ message, error = false }: { message: string; error?: boolean }) { const c=useColors(); if(!message)return null; return <View accessibilityLiveRegion="polite" style={[styles.notice,{backgroundColor:c.secondary,borderLeftColor:error?c.destructive:c.primary}]}><Txt style={{color:error?c.destructive:c.foreground}}>{message}</Txt></View>; }
export function Screen({ title, children, back = false, subtitle }: { title: string; children: React.ReactNode; back?: boolean; subtitle?: string }) {
  const c=useColors(); const insets=useSafeAreaInsets();
  return <View style={{flex:1,backgroundColor:c.background}}><KeyboardAwareScrollViewCompat keyboardShouldPersistTaps="handled" bottomOffset={24} contentContainerStyle={{width:"100%",maxWidth:800,alignSelf:"center",paddingHorizontal:22,paddingTop:Platform.OS==="web"?75:insets.top+18,paddingBottom:Platform.OS==="web"?118:insets.bottom+105,gap:20}}>
    <View style={{flexDirection:"row",alignItems:"center",gap:12}}>{back?<Pressable accessibilityLabel="Retour" onPress={()=>router.back()} hitSlop={12}><Feather name="arrow-left" size={23} color={c.foreground}/></Pressable>:<Image source={require("@/assets/images/icon.png")} style={{width:36,height:36,borderRadius:10}}/>}<View style={{flex:1}}><Txt style={{fontFamily:"Inter_700Bold",fontSize:23,lineHeight:30}}>{title}</Txt>{subtitle?<Txt style={{color:c.mutedForeground,fontSize:13}}>{subtitle}</Txt>:null}</View></View>{children}
  </KeyboardAwareScrollViewCompat></View>;
}
export function AuthGate() { const {t}=useLanguage(); return <Card><Feather name="lock" size={28}/><Heading>{t("login_title")}</Heading><Txt>{t("login_subtitle")}</Txt><Button title={t("login_btn")} onPress={()=>router.push("/auth")} icon="log-in"/></Card>; }
export const styles=StyleSheet.create({
  heading:{fontFamily:"Inter_700Bold",fontSize:20,lineHeight:28}, label:{fontFamily:"Inter_500Medium",fontSize:13,lineHeight:19},
  card:{borderWidth:1,padding:20,gap:14}, button:{minHeight:50,paddingVertical:13,paddingHorizontal:18,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:9},
  input:{borderWidth:1,minHeight:49,paddingHorizontal:14,paddingVertical:12,fontSize:15,fontFamily:"Inter_400Regular"},
  wrap:{flexDirection:"row",flexWrap:"wrap",gap:8},chip:{paddingHorizontal:13,paddingVertical:9},notice:{padding:14,borderLeftWidth:3,borderRadius:8},
  row:{flexDirection:"row",alignItems:"center",gap:12},muted:{fontSize:13},
});
