import React, { useEffect, useState } from "react";
import { Platform, Linking } from "react-native";
import Purchases, { type PurchasesPackage } from "react-native-purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMobileGetCredits, useMobileListTransactions, useMobileListInvoices, mobileVerifyPurchase, mobileSyncPurchases } from "@workspace/api-client-react";
import { useAuth, useLanguage, errorMessage } from "@/lib/providers";
import { Screen, Txt, Heading, Card, Button, Notice, AuthGate } from "@/components/UI";
import { useColors } from "@/hooks/useColors";

const productCredits:Record<string,number>={"fr.academik.app.starter":10,"fr.academik.app.essentiel":30,"fr.academik.app.pro":100};
export default function Billing() {
  const {user}=useAuth();const {t}=useLanguage();const c=useColors();const [packages,setPackages]=useState<PurchasesPackage[]>([]);const [busy,setBusy]=useState("");const [message,setMessage]=useState("");
  const credits=useMobileGetCredits({query:{enabled:!!user,retry:false}});const history=useMobileListTransactions({query:{enabled:!!user,retry:false}});const invoices=useMobileListInvoices({query:{enabled:!!user,retry:false}});
  const pendingKey=`academik-pending-${user?.id}`;
  const load=async()=>{
    if(!user)return;setBusy("load");setMessage("");
    try {
      const key=__DEV__||Platform.OS==="web"?process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY:Platform.OS==="ios"?process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY:process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
      if(!key)throw new Error("Les achats ne sont pas encore configurés pour ce store.");
      if(!await Purchases.isConfigured())Purchases.configure({apiKey:key,appUserID:`academik:${user.id}`});
      else if(await Purchases.getAppUserID()!==`academik:${user.id}`)await Purchases.logIn(`academik:${user.id}`);
      const offers=await Purchases.getOfferings();setPackages((offers.current?.availablePackages||[]).filter(p=>productCredits[p.product.identifier]));
      if(!offers.current?.availablePackages.length)throw new Error("Les produits du store ne sont pas encore disponibles. Aucun achat ne sera effectué.");
    }catch(e){setMessage(errorMessage(e));}finally{setBusy("");}
  };
  useEffect(()=>{void load();},[user?.id]);
  const verify=async(transactionId:string,productId:string)=>{
    await AsyncStorage.setItem(pendingKey,JSON.stringify({transactionId,productId}));
    const result=await mobileVerifyPurchase({transactionId,productId});
    await AsyncStorage.removeItem(pendingKey);
    await Promise.all([credits.refetch(),history.refetch()]);
    return result;
  };
  const purchase=async(pkg:PurchasesPackage)=>{
    setBusy(pkg.identifier);setMessage("");
    try {const result=await Purchases.purchasePackage(pkg);const confirmation=await verify(result.transaction.transactionIdentifier,result.productIdentifier);setMessage(confirmation.alreadyCredited?"Cet achat est déjà synchronisé.":`${confirmation.credits} ${t("credits_added")}`);}
    catch(e:any){setMessage(e.userCancelled?"Achat annulé. Aucun crédit ajouté.":`${errorMessage(e)} Si le store a confirmé le paiement, utilisez « Synchroniser mes achats » sans racheter.`);}
    finally{setBusy("");}
  };
  const sync=async()=>{
    setBusy("sync");setMessage("");
    try {
      const result=await mobileSyncPurchases();
      await AsyncStorage.removeItem(pendingKey);
      await Promise.all([credits.refetch(),history.refetch()]);
      setMessage(Number(result.creditsAdded)>0?`${result.creditsAdded} crédits synchronisés, solde actualisé.`:"Synchronisation terminée. Votre solde est à jour.");
    }catch(e){setMessage(errorMessage(e));}finally{setBusy("");}
  };
  return <Screen title={t("buy_credits")} back>{!user?<AuthGate/>:<>
    <Card><Txt style={{color:c.mutedForeground}}>{t("available_credits")}</Txt><Txt style={{fontSize:42,lineHeight:50,fontFamily:"Inter_700Bold",color:c.primary}}>{String(credits.data?.credits??"—")}</Txt><Txt>Achats ponctuels, sans abonnement ni renouvellement automatique.</Txt></Card>
    {__DEV__||Platform.OS==="web"?<Notice message="Mode test RevenueCat : les achats simulés de cet aperçu ne constituent pas des paiements Apple ou Google."/>:null}
    <Notice message={message}/>{packages.map(pkg=><Card key={pkg.identifier}><Heading>{productCredits[pkg.product.identifier]} {t("credits")}</Heading><Txt style={{fontSize:28,lineHeight:36,fontFamily:"Inter_700Bold"}}>{pkg.product.priceString}</Txt><Txt style={{color:c.mutedForeground,fontSize:13}}>{pkg.product.description}</Txt><Button title={`${t("buy_credits")} · ${pkg.product.priceString}`} icon="shopping-bag" disabled={!!busy} busy={busy===pkg.identifier} onPress={()=>void purchase(pkg)}/></Card>)}
    <Button title="Actualiser les offres" secondary busy={busy==="load"} disabled={!!busy} onPress={()=>void load()}/>
    <Button title="Synchroniser mes achats" secondary busy={busy==="sync"} disabled={!!busy} onPress={()=>void sync()}/>
    <Txt style={{fontSize:12,color:c.mutedForeground}}>Le prix et la devise affichés viennent du store. Les achats sont associés à votre compte Academik. Les crédits consommables ne sont pas des abonnements et ne se restaurent pas comme un achat permanent. Apple ou Google fournit le reçu du paiement. Pour une demande de remboursement, utilisez leur assistance.</Txt>
    <Button title="Assistance du store" secondary icon="external-link" onPress={()=>void Linking.openURL(Platform.OS==="ios"?"https://reportaproblem.apple.com":"https://support.google.com/googleplay/answer/2479637")}/>
    <Heading>{t("action_costs")}</Heading><Card><Txt>Recherche : 1 crédit par tranche de 10 articles.{"\n"}Analyse, synthèse, confrontation, cartographie, bibliographie et équations : 1 crédit par action.</Txt></Card>
    <Heading>Historique des crédits</Heading>{history.error?<Notice message={history.error.message} error/>:null}{history.data?.length===0?<Txt>{t("no_purchases")}</Txt>:null}{history.data?.slice(0,100).map((txn:any)=><Card key={txn.id}><Txt style={{fontFamily:"Inter_600SemiBold"}}>{txn.amount>0?"+":""}{txn.amount} {t("credits")}</Txt><Txt style={{fontSize:12,color:c.mutedForeground}}>{txn.description}{"\n"}{new Date(txn.createdAt).toLocaleString()}</Txt></Card>)}
    {invoices.data?.length?<><Heading>Historique des achats web</Heading>{invoices.data.map((invoice:any)=><Card key={invoice.id}><Txt>{invoice.credits} {t("credits")} · {Number(invoice.amount).toFixed(2)} €</Txt><Txt style={{fontSize:12,color:c.mutedForeground}}>{new Date(invoice.createdAt).toLocaleDateString()} · {invoice.status}</Txt></Card>)}</>:null}
  </>}</Screen>;
}
