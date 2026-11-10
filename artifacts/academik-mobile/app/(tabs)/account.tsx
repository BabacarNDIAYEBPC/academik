import React, { useState } from "react";
import { router } from "expo-router";
import { Screen, Txt, Card, Heading, Button, Field, Chips, Notice, AuthGate } from "@/components/UI";
import { useAuth, useLanguage, languageNames, errorMessage } from "@/lib/providers";
import { translations } from "@/i18n/translations";
import { useColors } from "@/hooks/useColors";
export default function Account() {
  const auth=useAuth();const {language,setLanguage,t}=useLanguage();const c=useColors();const [confirm,setConfirm]=useState("");const [showDelete,setShowDelete]=useState(false);const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  const run=async(fn:()=>Promise<void>)=>{setBusy(true);setMessage("");try{await fn();router.replace("/");}catch(e){setMessage(errorMessage(e));}finally{setBusy(false);}};
  return <Screen title="Compte" subtitle="Academik">
    {auth.user?<Card><Heading>{auth.user.firstName} {auth.user.lastName}</Heading><Txt>{auth.user.email}</Txt><Button title={t("buy_credits")} icon="credit-card" onPress={()=>router.push("/billing")}/><Button title={t("logout")} secondary busy={busy} onPress={()=>void run(auth.logout)}/></Card>:<AuthGate/>}
    {auth.user?<Button title="Administration" secondary icon="shield" onPress={()=>router.push("/admin")}/>:null}
    <Card><Heading>{t("language_label")}</Heading><Chips options={Object.keys(translations).map(code=>[code,languageNames[code]||code])} values={[language]} onChange={setLanguage}/></Card>
    <Card><Heading>Informations et assistance</Heading><Button title={t("contact_title","Contacter Academik")} secondary icon="mail" onPress={()=>router.push("/contact")}/>{[["privacy","Confidentialité et données"],["cgu","Conditions d’utilisation"],["cgv","Conditions de vente"],["rgpd","Vos droits RGPD"]].map(([page,title])=><Button key={page} title={title} secondary onPress={()=>router.push({pathname:"/legal",params:{page}})}/>)}</Card>
    <Notice message={message} error/>
    {auth.user?<Card><Heading>Suppression du compte</Heading><Txt style={{fontSize:13,color:c.mutedForeground}}>Supprime définitivement le compte, les recherches sauvegardées et les données associées, conformément aux obligations légales de conservation. Les crédits non utilisés seront perdus. Les remboursements sont traités par Apple ou Google pour leurs achats. Une empreinte hachée d’achat, sans nom, e-mail ni lien au compte, est conservée pour empêcher un double crédit frauduleux.</Txt>{showDelete?<><Field label="Saisissez SUPPRIMER pour confirmer" value={confirm} onChangeText={setConfirm} autoCapitalize="characters"/><Button title="Supprimer définitivement mon compte" danger busy={busy} disabled={confirm!=="SUPPRIMER"} onPress={()=>void run(auth.deleteAccount)}/><Button title="Annuler" secondary onPress={()=>{setShowDelete(false);setConfirm("");}}/></>:<Button title="Supprimer mon compte" secondary onPress={()=>setShowDelete(true)}/>}</Card>:null}
    <Txt style={{color:c.mutedForeground,fontSize:12}}>Academik · iOS & Android · v1.0.0</Txt>
  </Screen>;
}
