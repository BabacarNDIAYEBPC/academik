import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { mobileRegister, mobileForgotPassword, mobileResetPassword, mobileResendCode } from "@workspace/api-client-react";
import { useAuth, useLanguage, errorMessage } from "@/lib/providers";
import { Screen, Txt, Card, Field, Button, Notice } from "@/components/UI";
import { useColors } from "@/hooks/useColors";

type Mode="login"|"register"|"verify"|"forgot"|"reset";
export default function AuthScreen() {
  const params=useLocalSearchParams();const [mode,setMode]=useState<Mode>(params.mode==="register"?"register":"login");
  const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [confirmation,setConfirmation]=useState("");const [firstName,setFirstName]=useState("");const [lastName,setLastName]=useState("");const [code,setCode]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  const auth=useAuth();const {t}=useLanguage();const c=useColors();
  const run=async()=>{
    setMessage("");setBusy(true);
    try{
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))throw new Error(t("email"));
      if(["register","reset"].includes(mode)&&(password.length<8||password!==confirmation))throw new Error(password.length<8?t("min_8_chars"):t("err_pass_diff_desc"));
      if(mode==="login"){await auth.signIn({email:email.trim(),password});router.back();}
      if(mode==="register"){await mobileRegister({email:email.trim(),password,firstName,lastName});setMode("verify");}
      if(mode==="verify"){await auth.signIn({email:email.trim(),code},true);router.back();}
      if(mode==="forgot"){await mobileForgotPassword({email:email.trim()});setMode("reset");}
      if(mode==="reset"){await mobileResetPassword({email:email.trim(),code,password});setMode("login");setPassword("");setMessage(t("password_changed_desc"));}
    }catch(e:any){if(e.data?.needsVerification){setMode("verify");}setMessage(errorMessage(e));}finally{setBusy(false);}
  };
  const title={login:"login_title",register:"register_title",verify:"verify_title",forgot:"forgot_title",reset:"reset_title"}[mode];
  const button={login:"login_btn",register:"register_btn",verify:"verify_btn",forgot:"send_code",reset:"reset_btn"}[mode];
  return <Screen title={t(title)} back subtitle="Academik">
    <Card>
      {mode==="register"?<><Field label={t("firstname")} value={firstName} onChangeText={setFirstName} autoComplete="given-name"/><Field label={t("lastname")} value={lastName} onChangeText={setLastName} autoComplete="family-name"/></>:null}
      <Field label={t("email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email"/>
      {["verify","reset"].includes(mode)?<Field label={t("verification_code")} value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code"/>:null}
      {["login","register","reset"].includes(mode)?<Field label={t("password")} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={mode==="login"?"current-password":"new-password"}/>:null}
      {["register","reset"].includes(mode)?<Field label={t("confirm_password")} value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none"/>:null}
      <Notice message={message} error/>
      <Button title={t(button)} busy={busy} onPress={()=>void run()} testID="auth-submit"/>
      {mode==="verify"?<Button title={t("resend_code")} secondary onPress={()=>{void mobileResendCode({email}).then(()=>setMessage(t("code_resent"))).catch(e=>setMessage(errorMessage(e)));}}/>:null}
      <View style={{gap:16,marginTop:8}}>
        {mode==="login"?<><Pressable onPress={()=>{setMode("forgot");setMessage("");}}><Txt style={{color:c.primary}}>{t("forgot_password")}</Txt></Pressable><Pressable onPress={()=>{setMode("register");setMessage("");}}><Txt style={{color:c.primary}}>{t("create_account_link")}</Txt></Pressable></>:<Pressable onPress={()=>{setMode("login");setMessage("");}}><Txt style={{color:c.primary}}>{t("back_to_login")}</Txt></Pressable>}
      </View>
    </Card>
    <Txt style={{color:c.mutedForeground,fontSize:12}}>{t("terms_agree")} {t("terms_link")} {t("and_privacy")} {t("privacy_link")}.</Txt>
    <Button secondary title={t("privacy_link")} onPress={()=>router.push({pathname:"/legal",params:{page:"privacy"}})}/>
    <Button secondary title={t("terms_link")} onPress={()=>router.push({pathname:"/legal",params:{page:"cgu"}})}/>
  </Screen>;
}
