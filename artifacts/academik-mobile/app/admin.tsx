import React,{useState} from "react";
import {View} from "react-native";
import {useMobileAdminMe,useMobileAdminStats,useMobileAdminUsers,mobileAdminLogin,mobileAdminLogout} from "@workspace/api-client-react";
import {Screen,Card,Heading,Txt,Field,Button,Notice,AuthGate,styles} from "@/components/UI";
import {useAuth,errorMessage} from "@/lib/providers";
export default function Admin(){
  const {user}=useAuth();const auth=useMobileAdminMe({query:{enabled:!!user,retry:false}});const allowed=!!auth.data?.authenticated;
  const stats=useMobileAdminStats({query:{enabled:allowed,retry:false}});
  const [page,setPage]=useState(0);const [search,setSearch]=useState("");const [submitted,setSubmitted]=useState("");
  const users=useMobileAdminUsers({page,search:submitted},{query:{enabled:allowed,retry:false}});
  const [password,setPassword]=useState("");const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
  const data=stats.data as any;const rows=users.data as any;
  return <Screen title="Administration" back>{!user?<AuthGate/>:!allowed?<Card><Txt>Accès réservé au propriétaire. Le contrôle d’accès est effectué par le serveur.</Txt><Field label="Mot de passe administrateur" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none"/><Button title="Se connecter" busy={busy} onPress={()=>{setBusy(true);void mobileAdminLogin({password}).then(()=>{setPassword("");return auth.refetch();}).catch(e=>setMessage(errorMessage(e))).finally(()=>setBusy(false));}}/><Notice message={message||auth.error?.message||""} error/></Card>:<>
  <Notice message={message||stats.error?.message||users.error?.message||""} error/>
  <Card><Heading>Statistiques générales</Heading>{data?<><Txt>Utilisateurs : {data.users.total} · vérifiés : {data.users.verified}{"\n"}Conversion : {data.users.conversionRate}%{"\n"}Nouveaux : {data.users.newToday} aujourd’hui, {data.users.newLast7d} sur 7 jours, {data.users.newLast30d} sur 30 jours.</Txt><Txt>Recettes web enregistrées : {data.revenue.total} €{"\n"}Commandes web : {data.revenue.orders} · Crédits vendus web : {data.revenue.creditsSold}</Txt><Txt>Utilisateurs actifs : {data.activity.activeUsers}{"\n"}Recherches sauvegardées : {data.activity.totalSearches}{"\n"}Crédits consommés : {data.activity.creditsSpent}</Txt></>:<Txt>Chargement…</Txt>}<Button title="Actualiser" secondary onPress={()=>{void stats.refetch();void users.refetch();}}/></Card>
  <Card><Heading>Utilisateurs</Heading><Field label="Rechercher par nom ou e-mail" value={search} onChangeText={setSearch}/><Button title="Rechercher" onPress={()=>{setPage(0);setSubmitted(search);}}/><Txt>{rows?.total??0} utilisateurs</Txt></Card>
  {rows?.users?.map((u:any)=><Card key={u.id}><Heading>{u.firstName} {u.lastName}</Heading><Txt>{u.email}</Txt><Txt>{u.verified?"Vérifié":"Non vérifié"} · {new Date(u.createdAt).toLocaleDateString()}{"\n"}{u.credits} crédits · {u.searches} recherches · {u.spent} € (web)</Txt></Card>)}
  <View style={styles.row}><View style={{flex:1}}><Button title="Précédent" secondary disabled={page===0} onPress={()=>setPage(p=>p-1)}/></View><Txt>{page+1}/{Math.max(1,rows?.pages||1)}</Txt><View style={{flex:1}}><Button title="Suivant" secondary disabled={page+1>=(rows?.pages||1)} onPress={()=>setPage(p=>p+1)}/></View></View>
  <Card><Heading>Inscriptions récentes</Heading>{data?.dailySignups?.map((d:any)=><Txt key={d.date}>{new Date(d.date).toLocaleDateString()} : {d.count}</Txt>)}</Card>
  <Button title="Fermer la session administrateur" secondary onPress={()=>{void mobileAdminLogout().then(()=>auth.refetch()).catch(e=>setMessage(errorMessage(e)));}}/>
  </>}</Screen>;
}
