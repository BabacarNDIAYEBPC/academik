import React, { useEffect, useState } from "react";
import { View, Pressable, Linking, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { mobileSearchArticles, mobileAnalyzeArticles, mobileGenerateBibliography, mobileGenerateEquations, mobileSaveBibliography, useMobileGetCredits } from "@workspace/api-client-react";
import { useAuth, useLanguage, useResearch, errorMessage, type Article } from "@/lib/providers";
import { useColors } from "@/hooks/useColors";
import { Screen, Txt, Heading, Card, Field, Button, Chips, Notice, AuthGate, styles } from "@/components/UI";
import { copyText, exportWord, shareText } from "@/lib/export";

const platforms:[string,string][]=[["google_scholar","Google Scholar"],["pubmed","PubMed"],["hal","HAL"],["cairn","Cairn"],["sciencedirect","ScienceDirect"]];
export default function Search() {
  const {user}=useAuth();const {t}=useLanguage();const c=useColors();const cache=useQueryClient();
  const {config,setConfig,articles,setArticles,outputs,setOutputs}=useResearch();
  const [advanced,setAdvanced]=useState(false);const [selected,setSelected]=useState<number[]>([]);const [busy,setBusy]=useState("");const [message,setMessage]=useState("");const [consent,setConsent]=useState(false);
  const [filter,setFilter]=useState("");const [sort,setSort]=useState("default");const [page,setPage]=useState(0);const [resultType,setResultType]=useState("all");const [resultYear,setResultYear]=useState("");
  const credits=useMobileGetCredits({query:{enabled:!!user,retry:false}});
  useEffect(()=>{setConsent(false);void AsyncStorage.getItem(`academik-ai-consent-${user?.id}`).then(v=>setConsent(v==="yes"));},[user?.id]);
  useEffect(()=>{setSelected([]);setPage(0);},[articles]);
  const field=(key:keyof typeof config,value:any)=>setConfig(prev=>({...prev,[key]:value}));
  const action=async(name:string,fn:()=>Promise<void>)=>{setBusy(name);setMessage("");try{await fn();}catch(e){setMessage(errorMessage(e));}finally{setBusy("");void cache.invalidateQueries({queryKey:["/api/credits"]});void credits.refetch();}};
  const needQuery=()=>{if(!config.query.trim()&&!config.domain.trim())throw new Error(t("no_query"));if(!consent)throw new Error("Veuillez accepter l’utilisation de l’IA pour continuer.");};
  const selectedArticles=selected.map(i=>articles[i]).filter(Boolean);
  const analyze=(type:string,all=false,single?:Article)=>void action(type,async()=>{
    needQuery();const list=single?[single]:all?articles:selectedArticles;if(!list.length)throw new Error(t("select_at_least"));
    const result=await mobileAnalyzeArticles({articles:list.map(a=>({title:a.title,authors:`${a.lastName||""}, ${a.firstName||""}`,year:a.year,source:a.publisher})),analysisType:type,query:config.query,language:config.language});
    setOutputs(prev=>({...prev,[type]:String(result.content||"")}));
  });
  const filtered=articles.map((article,index)=>({article,index})).filter(({article:a})=>(!filter||`${a.title} ${a.lastName} ${a.publisher}`.toLowerCase().includes(filter.toLowerCase()))&&(resultType==="all"||a.type===resultType)&&(!resultYear||String(a.year)===resultYear)).sort((a,b)=>sort==="recent"?Number(b.article.year)-Number(a.article.year):sort==="oldest"?Number(a.article.year)-Number(b.article.year):sort==="type"?String(a.article.type).localeCompare(String(b.article.type)):a.index-b.index);
  const outputNames:Record<string,string>={single:t("analysis_title_summary"),multiple:t("analysis_title_selection"),confrontation:t("analysis_title_confrontation"),mapping:t("analysis_title_mapping"),synthesis:t("analysis_title_complete"),bibliography:t("bib_title"),equations:t("equations_title")};
  return <Screen title={t("lit_review")} subtitle={user?`${credits.data?.credits??"—"} ${t("credits")}`:"Academik"}>
    {!user?<AuthGate/>:<>
    <Card>
      <Field label={t("search_query_label")} value={config.query} onChangeText={v=>field("query",v)} placeholder={t("search_placeholder")} multiline/>
      <Field label={t("domain_label","Domaine")} value={config.domain} onChangeText={v=>field("domain",v)} placeholder="Sciences, santé, éducation…"/>
      <Pressable onPress={()=>setAdvanced(v=>!v)} style={styles.row}><Feather name="sliders" color={c.primary} size={18}/><Txt style={{color:c.primary}}>{t("filters")} {advanced?"−":"+"}</Txt></Pressable>
      {advanced?<>
        <Txt style={styles.label}>{t("platforms")}</Txt><Chips options={platforms} values={config.platforms} onChange={key=>field("platforms",config.platforms.includes(key)?config.platforms.filter(x=>x!==key):[...config.platforms,key])}/>
        <Txt style={styles.label}>{t("count_label")}</Txt><Chips options={[10,20,30,40,50].map(n=>[String(n),String(n)])} values={[String(config.articleCount)]} onChange={key=>field("articleCount",Number(key))}/>
        <View style={styles.row}><View style={{flex:1}}><Field label={t("from_year")} value={config.periodStart} keyboardType="number-pad" onChangeText={v=>field("periodStart",v)}/></View><View style={{flex:1}}><Field label={t("to_year")} value={config.periodEnd} keyboardType="number-pad" onChangeText={v=>field("periodEnd",v)}/></View></View>
        <Txt style={styles.label}>{t("language_label")}</Txt><Chips options={[["fr",t("lang_fr")],["en",t("lang_en")],["both",t("lang_both")]]} values={[config.language]} onChange={v=>field("language",v)}/>
        <Txt style={styles.label}>{t("level_label")}</Txt><Chips options={[["academic",t("level_academic")],["mixed",t("level_mixed")],["professional",t("level_professional")]]} values={[config.level]} onChange={v=>field("level",v)}/>
        <Txt style={styles.label}>{t("source_types_label")}</Txt><Chips options={[["scientific_articles",t("src_scientific")],["books",t("src_books")],["reports",t("src_reports")],["recommendations",t("src_recommendations")],["referentials",t("src_referentials")]]} values={config.sourceTypes} onChange={v=>field("sourceTypes",config.sourceTypes.includes(v)?config.sourceTypes.filter(x=>x!==v):[...config.sourceTypes,v])}/>
        <Txt style={styles.label}>Accès aux sources</Txt><Chips options={[["all","Tous (mixte)"],["open_access","Accès libre"],["paid","Payant"]]} values={[config.accessType]} onChange={v=>field("accessType",v)}/>
        {config.accessType==="all"?<Field label="Proportion en accès libre (%)" value={String(config.openAccessProportion)} keyboardType="number-pad" onChangeText={v=>field("openAccessProportion",Math.min(100,Math.max(0,Number(v))))}/>:null}
      </>:null}
      <View style={styles.row}><Switch accessibilityLabel="Accepter le traitement IA" value={consent} trackColor={{true:c.primary}} onValueChange={v=>{setConsent(v);void AsyncStorage.setItem(`academik-ai-consent-${user?.id}`,v?"yes":"no");}}/><Txt style={{flex:1,fontSize:12,lineHeight:19,color:c.mutedForeground}}>J’accepte l’envoi de ma requête et des références sélectionnées à OpenAI pour générer les résultats. Ne saisissez pas de données personnelles sensibles.</Txt></View>
      <Pressable onPress={()=>router.push({pathname:"/legal",params:{page:"privacy"}})}><Txt style={{color:c.primary,fontSize:12}}>{t("privacy_link")}</Txt></Pressable>
      <Button title={`${t("search_btn")} · ${Math.ceil(config.articleCount/10)} ${t("credits")}`} icon="search" busy={busy==="search"} disabled={!!busy} testID="search-submit" onPress={()=>void action("search",async()=>{needQuery();if(!config.platforms.length)throw new Error("Choisissez une plateforme");if(Number(config.periodStart)>Number(config.periodEnd))throw new Error("Période invalide");const result=await mobileSearchArticles({...config});setArticles(result.articles as Article[]||[]);setOutputs({});if(!(result.articles as any[])?.length)setMessage(t("no_articles"));})}/>
      <Button title={`${t("equations_btn")} · 1 ${t("credit")}`} secondary disabled={!!busy} busy={busy==="equations"} onPress={()=>void action("equations",async()=>{needQuery();const result=await mobileGenerateEquations({...config});setOutputs(prev=>({...prev,equations:String(result.content||"")}));})}/>
    </Card>
    <Notice message={message} error/>
    {message.toLowerCase().includes("crédit")||message.includes("402")?<Button title={t("buy_credits")} onPress={()=>router.push("/billing")}/>:null}
    {articles.length?<>
      <Card><Heading>{articles.length} {t("results_plural")}</Heading><Field label={t("filters")} value={filter} onChangeText={v=>{setFilter(v);setPage(0);}} placeholder="Titre, auteur, source…"/>
        <Chips options={[["default",t("sort_default")],["recent",t("sort_recent")],["oldest",t("sort_oldest")],["type",t("sort_type")]]} values={[sort]} onChange={v=>{setSort(v);setPage(0);}}/>
        <Chips options={[["all",t("all_types")],...Array.from(new Set(articles.map(a=>a.type).filter(Boolean))).map(type=>[String(type),String(type)] as [string,string])]} values={[resultType]} onChange={v=>{setResultType(v);setPage(0);}}/>
        <Field label={`${t("filter_year")} (${t("all_years")}: vide)`} value={resultYear} onChangeText={v=>{setResultYear(v);setPage(0);}} keyboardType="number-pad"/>
        <Button title={`${selected.length} ${t("selected_plural")} · ${selected.length===filtered.length?t("deselect_all"):t("select_all")}`} secondary onPress={()=>setSelected(selected.length===filtered.length?[]:filtered.map(x=>x.index))}/>
      </Card>
      {filtered.slice(page*10,page*10+10).map(({article:a,index})=><Card key={`${index}-${a.title}`}><Pressable style={[styles.row,{alignItems:"flex-start"}]} accessibilityRole="checkbox" accessibilityState={{checked:selected.includes(index)}} onPress={()=>setSelected(prev=>prev.includes(index)?prev.filter(i=>i!==index):[...prev,index])}><Feather name={selected.includes(index)?"check-square":"square"} color={c.primary} size={22}/><Txt style={{flex:1,fontFamily:"Inter_600SemiBold"}}>{a.title}</Txt></Pressable><Txt style={{fontSize:13,color:c.mutedForeground}}>{a.lastName} {a.firstName} · {a.year}{"\n"}{a.publisher} · {a.platform}</Txt><View style={styles.row}><Txt style={{fontSize:12,color:c.primary}}>{a.type} {a.isOpenAccess?"· Accès libre":""}</Txt></View>{a.url&&/^https?:\/\//.test(a.url)?<Button title="Consulter la source" secondary icon="external-link" onPress={()=>void Linking.openURL(a.url!)}/>:null}<Button title={t("summary_btn")} secondary disabled={!!busy} onPress={()=>analyze("single",false,a)}/></Card>)}
      {!filtered.length?<Notice message={t("no_articles")}/>:null}
      {filtered.length>10?<View style={styles.row}><View style={{flex:1}}><Button title="←" disabled={page===0} secondary onPress={()=>setPage(p=>p-1)}/></View><Txt>{page+1}/{Math.ceil(filtered.length/10)}</Txt><View style={{flex:1}}><Button title="→" disabled={(page+1)*10>=filtered.length} secondary onPress={()=>setPage(p=>p+1)}/></View></View>:null}
      <Card><Heading>{t("analysis_actions")}</Heading><Txt style={{fontSize:12,color:c.mutedForeground}}>Chaque analyse, bibliographie ou équation coûte 1 crédit. Vérifiez les résultats dans les sources d’origine.</Txt>
        <Button title={t("analysis_title_selection")} secondary disabled={!!busy||!selected.length} onPress={()=>analyze("multiple")}/>
        <Button title={t("confront_btn")} secondary disabled={!!busy||selected.length<2} onPress={()=>analyze("confrontation")}/>
        <Button title={t("mapping_btn")} secondary disabled={!!busy||!selected.length} onPress={()=>analyze("mapping")}/>
        <Button title={t("synthesis_all_btn")} secondary disabled={!!busy} onPress={()=>analyze("synthesis",true)}/>
        <Txt style={styles.label}>{t("bibliography_btn")}</Txt><Chips options={[["apa7","APA 7"],["vancouver","Vancouver"],["mla","MLA 9"],["chicago","Chicago 17"]]} values={[config.norm]} onChange={v=>field("norm",v)}/>
        <Button title={`${t("bibliography_btn")} (${selected.length||articles.length})`} disabled={!!busy} busy={busy==="bibliography"} onPress={()=>void action("bibliography",async()=>{needQuery();const result=await mobileGenerateBibliography({articles:selected.length?selectedArticles:articles,norm:config.norm,query:config.query});setOutputs(prev=>({...prev,bibliography:String(result.content||"")}));})}/>
        <Button title={t("save","Sauvegarder")} icon="save" secondary disabled={!!busy} busy={busy==="save"} onPress={()=>void action("save",async()=>{await mobileSaveBibliography({title:config.query||config.domain,query:config.query,norm:config.norm.toUpperCase(),sources:articles,content:outputs.bibliography||""});void cache.invalidateQueries({queryKey:["/api/bibliographies"]});setMessage(t("search_saved"));})}/>
      </Card>
    </>:null}
    {busy?<Notice message={`${t("generating")} ${outputNames[busy]||""}`}/>:null}
    {Object.entries(outputs).filter(([,content])=>!!content).map(([key,content])=><Card key={key}><Heading>{outputNames[key]||key}</Heading><Txt selectable style={{fontSize:14,lineHeight:23}}>{content}</Txt><Button title={t("export_word","Exporter Word")} secondary icon="download" disabled={!!busy} onPress={()=>void action("export",()=>exportWord(outputNames[key]||key,content))}/><View style={styles.row}><View style={{flex:1}}><Button title={t("copy","Copier")} secondary icon="copy" onPress={()=>void action("copy",async()=>{await copyText(content);setMessage("Copié");})}/></View><View style={{flex:1}}><Button title="Partager" secondary icon="share" onPress={()=>void action("share",()=>shareText(content))}/></View></View><Pressable onPress={()=>router.push({pathname:"/contact",params:{subject:"Signalement d’un résultat IA",message:content.slice(0,2000)}})}><Txt style={{fontSize:12,color:c.mutedForeground}}>Signaler un résultat inapproprié ou incorrect</Txt></Pressable></Card>)}
    </>}
  </Screen>;
}
