import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Revue from "@/pages/Revue";
import Billing from "@/pages/Billing";
import Admin from "@/pages/Admin";
import BibliographieApa from "@/pages/seo/BibliographieApa";
import ApaCitationGenerator from "@/pages/seo/ApaCitationGenerator";
import RevueLitterature from "@/pages/seo/RevueLitterature";
import LiteratureReview from "@/pages/seo/LiteratureReview";
import BiblioVancouver from "@/pages/seo/BiblioVancouver";
import VancouverCitation from "@/pages/seo/VancouverCitation";
import BiblioMla from "@/pages/seo/BiblioMla";
import MlaCitation from "@/pages/seo/MlaCitation";
import BiblioChicago from "@/pages/seo/BiblioChicago";
import ChicagoCitation from "@/pages/seo/ChicagoCitation";
import MemoireThese from "@/pages/seo/MemoireThese";
import DissertationHelp from "@/pages/seo/DissertationHelp";
import Etudiant from "@/pages/seo/Etudiant";
import Students from "@/pages/seo/Students";
import Chercheur from "@/pages/seo/Chercheur";
import Researchers from "@/pages/seo/Researchers";
import RechercheBibliographique from "@/pages/seo/RechercheBibliographique";
import SyntheseBibliographique from "@/pages/seo/SyntheseBibliographique";
import ReussirMemoireMaster from "@/pages/seo/ReussirMemoireMaster";
import NotFound from "@/pages/NotFound";

import SeoPageLang from "@/pages/seo/SeoPageLang";
import { SEO_PAGES } from "@/pages/seo/seoData";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/connexion");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  if (!user) return null;

  return <Component />;
}

function HomeRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return user ? <Dashboard /> : <Landing />;
}

function SeoRoute({ slug }: { slug: string }) {
  const data = SEO_PAGES[slug];
  if (!data) return <NotFound />;
  return <SeoPageLang data={data} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/connexion" component={Auth} />
      <Route path="/revue" component={() => <ProtectedRoute component={Revue} />} />
      <Route path="/billing" component={() => <ProtectedRoute component={Billing} />} />
      <Route path="/admin" component={Admin} />

      {/* FR pages */}
      <Route path="/bibliographie-apa" component={BibliographieApa} />
      <Route path="/revue-litterature" component={RevueLitterature} />
      <Route path="/bibliographie-vancouver" component={BiblioVancouver} />
      <Route path="/bibliographie-mla" component={BiblioMla} />
      <Route path="/bibliographie-chicago" component={BiblioChicago} />
      <Route path="/memoire-these" component={MemoireThese} />
      <Route path="/etudiant" component={Etudiant} />
      <Route path="/chercheur" component={Chercheur} />
      <Route path="/recherche-bibliographique" component={RechercheBibliographique} />
      <Route path="/synthese-bibliographique" component={SyntheseBibliographique} />
      <Route path="/reussir-memoire-master" component={ReussirMemoireMaster} />

      {/* EN pages */}
      <Route path="/en/apa-citation-generator" component={ApaCitationGenerator} />
      <Route path="/en/literature-review" component={LiteratureReview} />
      <Route path="/en/vancouver-citation" component={VancouverCitation} />
      <Route path="/en/mla-citation" component={MlaCitation} />
      <Route path="/en/chicago-citation" component={ChicagoCitation} />
      <Route path="/en/dissertation-help" component={DissertationHelp} />
      <Route path="/en/students" component={Students} />
      <Route path="/en/researchers" component={Researchers} />

      {/* ES pages */}
      <Route path="/es/generador-bibliografia-apa" component={() => <SeoRoute slug="es/generador-bibliografia-apa" />} />
      <Route path="/es/bibliografia-vancouver" component={() => <SeoRoute slug="es/bibliografia-vancouver" />} />
      <Route path="/es/bibliografia-mla" component={() => <SeoRoute slug="es/bibliografia-mla" />} />
      <Route path="/es/bibliografia-chicago" component={() => <SeoRoute slug="es/bibliografia-chicago" />} />
      <Route path="/es/revision-literatura" component={() => <SeoRoute slug="es/revision-literatura" />} />
      <Route path="/es/tesis-memoria" component={() => <SeoRoute slug="es/tesis-memoria" />} />
      <Route path="/es/estudiantes" component={() => <SeoRoute slug="es/estudiantes" />} />
      <Route path="/es/investigadores" component={() => <SeoRoute slug="es/investigadores" />} />

      {/* PT pages */}
      <Route path="/pt/gerador-bibliografia-apa" component={() => <SeoRoute slug="pt/gerador-bibliografia-apa" />} />
      <Route path="/pt/bibliografia-vancouver" component={() => <SeoRoute slug="pt/bibliografia-vancouver" />} />
      <Route path="/pt/bibliografia-mla" component={() => <SeoRoute slug="pt/bibliografia-mla" />} />
      <Route path="/pt/bibliografia-chicago" component={() => <SeoRoute slug="pt/bibliografia-chicago" />} />
      <Route path="/pt/revisao-literatura" component={() => <SeoRoute slug="pt/revisao-literatura" />} />
      <Route path="/pt/tese-dissertacao" component={() => <SeoRoute slug="pt/tese-dissertacao" />} />
      <Route path="/pt/estudantes" component={() => <SeoRoute slug="pt/estudantes" />} />
      <Route path="/pt/pesquisadores" component={() => <SeoRoute slug="pt/pesquisadores" />} />

      {/* DE pages */}
      <Route path="/de/literaturverzeichnis-apa" component={() => <SeoRoute slug="de/literaturverzeichnis-apa" />} />
      <Route path="/de/literaturverzeichnis-vancouver" component={() => <SeoRoute slug="de/literaturverzeichnis-vancouver" />} />
      <Route path="/de/literaturverzeichnis-mla" component={() => <SeoRoute slug="de/literaturverzeichnis-mla" />} />
      <Route path="/de/literaturverzeichnis-chicago" component={() => <SeoRoute slug="de/literaturverzeichnis-chicago" />} />
      <Route path="/de/literaturrecherche" component={() => <SeoRoute slug="de/literaturrecherche" />} />
      <Route path="/de/dissertation-hilfe" component={() => <SeoRoute slug="de/dissertation-hilfe" />} />
      <Route path="/de/studenten" component={() => <SeoRoute slug="de/studenten" />} />
      <Route path="/de/wissenschaftler" component={() => <SeoRoute slug="de/wissenschaftler" />} />

      {/* IT pages */}
      <Route path="/it/generatore-bibliografia-apa" component={() => <SeoRoute slug="it/generatore-bibliografia-apa" />} />
      <Route path="/it/bibliografia-vancouver" component={() => <SeoRoute slug="it/bibliografia-vancouver" />} />
      <Route path="/it/bibliografia-mla" component={() => <SeoRoute slug="it/bibliografia-mla" />} />
      <Route path="/it/bibliografia-chicago" component={() => <SeoRoute slug="it/bibliografia-chicago" />} />
      <Route path="/it/revisione-letteratura" component={() => <SeoRoute slug="it/revisione-letteratura" />} />
      <Route path="/it/tesi-dissertazione" component={() => <SeoRoute slug="it/tesi-dissertazione" />} />
      <Route path="/it/studenti" component={() => <SeoRoute slug="it/studenti" />} />
      <Route path="/it/ricercatori" component={() => <SeoRoute slug="it/ricercatori" />} />

      {/* NL pages */}
      <Route path="/nl/bibliografie-apa" component={() => <SeoRoute slug="nl/bibliografie-apa" />} />
      <Route path="/nl/bibliografie-vancouver" component={() => <SeoRoute slug="nl/bibliografie-vancouver" />} />
      <Route path="/nl/bibliografie-mla" component={() => <SeoRoute slug="nl/bibliografie-mla" />} />
      <Route path="/nl/bibliografie-chicago" component={() => <SeoRoute slug="nl/bibliografie-chicago" />} />
      <Route path="/nl/literatuuronderzoek" component={() => <SeoRoute slug="nl/literatuuronderzoek" />} />
      <Route path="/nl/scriptie-hulp" component={() => <SeoRoute slug="nl/scriptie-hulp" />} />
      <Route path="/nl/studenten" component={() => <SeoRoute slug="nl/studenten" />} />
      <Route path="/nl/onderzoekers" component={() => <SeoRoute slug="nl/onderzoekers" />} />

      {/* PL pages */}
      <Route path="/pl/bibliografia-apa" component={() => <SeoRoute slug="pl/bibliografia-apa" />} />
      <Route path="/pl/bibliografia-vancouver" component={() => <SeoRoute slug="pl/bibliografia-vancouver" />} />
      <Route path="/pl/bibliografia-mla" component={() => <SeoRoute slug="pl/bibliografia-mla" />} />
      <Route path="/pl/bibliografia-chicago" component={() => <SeoRoute slug="pl/bibliografia-chicago" />} />
      <Route path="/pl/przeglad-literatury" component={() => <SeoRoute slug="pl/przeglad-literatury" />} />
      <Route path="/pl/praca-dyplomowa" component={() => <SeoRoute slug="pl/praca-dyplomowa" />} />
      <Route path="/pl/studenci" component={() => <SeoRoute slug="pl/studenci" />} />
      <Route path="/pl/naukowcy" component={() => <SeoRoute slug="pl/naukowcy" />} />

      {/* RO pages */}
      <Route path="/ro/bibliografie-apa" component={() => <SeoRoute slug="ro/bibliografie-apa" />} />
      <Route path="/ro/bibliografie-vancouver" component={() => <SeoRoute slug="ro/bibliografie-vancouver" />} />
      <Route path="/ro/bibliografie-mla" component={() => <SeoRoute slug="ro/bibliografie-mla" />} />
      <Route path="/ro/bibliografie-chicago" component={() => <SeoRoute slug="ro/bibliografie-chicago" />} />
      <Route path="/ro/recenzie-literatura" component={() => <SeoRoute slug="ro/recenzie-literatura" />} />
      <Route path="/ro/teza-disertatie" component={() => <SeoRoute slug="ro/teza-disertatie" />} />
      <Route path="/ro/studenti" component={() => <SeoRoute slug="ro/studenti" />} />
      <Route path="/ro/cercetatori" component={() => <SeoRoute slug="ro/cercetatori" />} />

      {/* SV pages */}
      <Route path="/sv/bibliografi-apa" component={() => <SeoRoute slug="sv/bibliografi-apa" />} />
      <Route path="/sv/bibliografi-vancouver" component={() => <SeoRoute slug="sv/bibliografi-vancouver" />} />
      <Route path="/sv/bibliografi-mla" component={() => <SeoRoute slug="sv/bibliografi-mla" />} />
      <Route path="/sv/bibliografi-chicago" component={() => <SeoRoute slug="sv/bibliografi-chicago" />} />
      <Route path="/sv/litteraturgranskning" component={() => <SeoRoute slug="sv/litteraturgranskning" />} />
      <Route path="/sv/uppsats-hjalp" component={() => <SeoRoute slug="sv/uppsats-hjalp" />} />
      <Route path="/sv/studenter" component={() => <SeoRoute slug="sv/studenter" />} />
      <Route path="/sv/forskare" component={() => <SeoRoute slug="sv/forskare" />} />

      {/* NO pages */}
      <Route path="/no/bibliografi-apa" component={() => <SeoRoute slug="no/bibliografi-apa" />} />
      <Route path="/no/bibliografi-vancouver" component={() => <SeoRoute slug="no/bibliografi-vancouver" />} />
      <Route path="/no/bibliografi-mla" component={() => <SeoRoute slug="no/bibliografi-mla" />} />
      <Route path="/no/bibliografi-chicago" component={() => <SeoRoute slug="no/bibliografi-chicago" />} />
      <Route path="/no/litteraturgjennomgang" component={() => <SeoRoute slug="no/litteraturgjennomgang" />} />
      <Route path="/no/oppgave-hjelp" component={() => <SeoRoute slug="no/oppgave-hjelp" />} />
      <Route path="/no/studenter" component={() => <SeoRoute slug="no/studenter" />} />
      <Route path="/no/forskere" component={() => <SeoRoute slug="no/forskere" />} />

      {/* DA pages */}
      <Route path="/da/bibliografi-apa" component={() => <SeoRoute slug="da/bibliografi-apa" />} />
      <Route path="/da/bibliografi-vancouver" component={() => <SeoRoute slug="da/bibliografi-vancouver" />} />
      <Route path="/da/bibliografi-mla" component={() => <SeoRoute slug="da/bibliografi-mla" />} />
      <Route path="/da/bibliografi-chicago" component={() => <SeoRoute slug="da/bibliografi-chicago" />} />
      <Route path="/da/litteraturgennemgang" component={() => <SeoRoute slug="da/litteraturgennemgang" />} />
      <Route path="/da/opgave-hjaelp" component={() => <SeoRoute slug="da/opgave-hjaelp" />} />
      <Route path="/da/studerende" component={() => <SeoRoute slug="da/studerende" />} />
      <Route path="/da/forskere" component={() => <SeoRoute slug="da/forskere" />} />

      {/* FI pages */}
      <Route path="/fi/bibliografia-apa" component={() => <SeoRoute slug="fi/bibliografia-apa" />} />
      <Route path="/fi/bibliografia-vancouver" component={() => <SeoRoute slug="fi/bibliografia-vancouver" />} />
      <Route path="/fi/bibliografia-mla" component={() => <SeoRoute slug="fi/bibliografia-mla" />} />
      <Route path="/fi/bibliografia-chicago" component={() => <SeoRoute slug="fi/bibliografia-chicago" />} />
      <Route path="/fi/kirjallisuuskatsaus" component={() => <SeoRoute slug="fi/kirjallisuuskatsaus" />} />
      <Route path="/fi/opinnaytetyo-apu" component={() => <SeoRoute slug="fi/opinnaytetyo-apu" />} />
      <Route path="/fi/opiskelijat" component={() => <SeoRoute slug="fi/opiskelijat" />} />
      <Route path="/fi/tutkijat" component={() => <SeoRoute slug="fi/tutkijat" />} />

      {/* CS pages */}
      <Route path="/cs/bibliografie-apa" component={() => <SeoRoute slug="cs/bibliografie-apa" />} />
      <Route path="/cs/bibliografie-vancouver" component={() => <SeoRoute slug="cs/bibliografie-vancouver" />} />
      <Route path="/cs/bibliografie-mla" component={() => <SeoRoute slug="cs/bibliografie-mla" />} />
      <Route path="/cs/bibliografie-chicago" component={() => <SeoRoute slug="cs/bibliografie-chicago" />} />
      <Route path="/cs/prehled-literatury" component={() => <SeoRoute slug="cs/prehled-literatury" />} />
      <Route path="/cs/diplomova-prace" component={() => <SeoRoute slug="cs/diplomova-prace" />} />
      <Route path="/cs/studenti" component={() => <SeoRoute slug="cs/studenti" />} />
      <Route path="/cs/vedci" component={() => <SeoRoute slug="cs/vedci" />} />

      {/* HU pages */}
      <Route path="/hu/bibliografia-apa" component={() => <SeoRoute slug="hu/bibliografia-apa" />} />
      <Route path="/hu/bibliografia-vancouver" component={() => <SeoRoute slug="hu/bibliografia-vancouver" />} />
      <Route path="/hu/bibliografia-mla" component={() => <SeoRoute slug="hu/bibliografia-mla" />} />
      <Route path="/hu/bibliografia-chicago" component={() => <SeoRoute slug="hu/bibliografia-chicago" />} />
      <Route path="/hu/irodalomattekintes" component={() => <SeoRoute slug="hu/irodalomattekintes" />} />
      <Route path="/hu/szakdolgozat-segitseg" component={() => <SeoRoute slug="hu/szakdolgozat-segitseg" />} />
      <Route path="/hu/hallgatok" component={() => <SeoRoute slug="hu/hallgatok" />} />
      <Route path="/hu/kutatók" component={() => <SeoRoute slug="hu/kutatók" />} />

      {/* EL pages */}
      <Route path="/el/vivliografia-apa" component={() => <SeoRoute slug="el/vivliografia-apa" />} />
      <Route path="/el/vivliografia-vancouver" component={() => <SeoRoute slug="el/vivliografia-vancouver" />} />
      <Route path="/el/vivliografia-mla" component={() => <SeoRoute slug="el/vivliografia-mla" />} />
      <Route path="/el/vivliografia-chicago" component={() => <SeoRoute slug="el/vivliografia-chicago" />} />
      <Route path="/el/anaskopisi-vivliografias" component={() => <SeoRoute slug="el/anaskopisi-vivliografias" />} />
      <Route path="/el/ptychiak-ergasia" component={() => <SeoRoute slug="el/ptychiak-ergasia" />} />
      <Route path="/el/foitites" component={() => <SeoRoute slug="el/foitites" />} />
      <Route path="/el/erevnites" component={() => <SeoRoute slug="el/erevnites" />} />

      {/* RU pages */}
      <Route path="/ru/bibliografiya-apa" component={() => <SeoRoute slug="ru/bibliografiya-apa" />} />
      <Route path="/ru/bibliografiya-vancouver" component={() => <SeoRoute slug="ru/bibliografiya-vancouver" />} />
      <Route path="/ru/bibliografiya-mla" component={() => <SeoRoute slug="ru/bibliografiya-mla" />} />
      <Route path="/ru/bibliografiya-chicago" component={() => <SeoRoute slug="ru/bibliografiya-chicago" />} />
      <Route path="/ru/obzor-literatury" component={() => <SeoRoute slug="ru/obzor-literatury" />} />
      <Route path="/ru/dissertaciya-pomoshch" component={() => <SeoRoute slug="ru/dissertaciya-pomoshch" />} />
      <Route path="/ru/studenty" component={() => <SeoRoute slug="ru/studenty" />} />
      <Route path="/ru/issledovateli" component={() => <SeoRoute slug="ru/issledovateli" />} />

      {/* UK pages */}
      <Route path="/uk/bibliohrafiia-apa" component={() => <SeoRoute slug="uk/bibliohrafiia-apa" />} />
      <Route path="/uk/bibliohrafiia-vancouver" component={() => <SeoRoute slug="uk/bibliohrafiia-vancouver" />} />
      <Route path="/uk/bibliohrafiia-mla" component={() => <SeoRoute slug="uk/bibliohrafiia-mla" />} />
      <Route path="/uk/bibliohrafiia-chicago" component={() => <SeoRoute slug="uk/bibliohrafiia-chicago" />} />
      <Route path="/uk/ohliad-literatury" component={() => <SeoRoute slug="uk/ohliad-literatury" />} />
      <Route path="/uk/dysertaciia-dopomoha" component={() => <SeoRoute slug="uk/dysertaciia-dopomoha" />} />
      <Route path="/uk/studenty" component={() => <SeoRoute slug="uk/studenty" />} />
      <Route path="/uk/doslidnyky" component={() => <SeoRoute slug="uk/doslidnyky" />} />

      {/* TR pages */}
      <Route path="/tr/kaynakca-apa" component={() => <SeoRoute slug="tr/kaynakca-apa" />} />
      <Route path="/tr/kaynakca-vancouver" component={() => <SeoRoute slug="tr/kaynakca-vancouver" />} />
      <Route path="/tr/kaynakca-mla" component={() => <SeoRoute slug="tr/kaynakca-mla" />} />
      <Route path="/tr/kaynakca-chicago" component={() => <SeoRoute slug="tr/kaynakca-chicago" />} />
      <Route path="/tr/literatur-taramasi" component={() => <SeoRoute slug="tr/literatur-taramasi" />} />
      <Route path="/tr/tez-yardim" component={() => <SeoRoute slug="tr/tez-yardim" />} />
      <Route path="/tr/ogrenciler" component={() => <SeoRoute slug="tr/ogrenciler" />} />
      <Route path="/tr/arastirmacılar" component={() => <SeoRoute slug="tr/arastirmacılar" />} />

      {/* AR pages */}
      <Route path="/ar/bibliughrafia-apa" component={() => <SeoRoute slug="ar/bibliughrafia-apa" />} />
      <Route path="/ar/bibliughrafia-vancouver" component={() => <SeoRoute slug="ar/bibliughrafia-vancouver" />} />
      <Route path="/ar/bibliughrafia-mla" component={() => <SeoRoute slug="ar/bibliughrafia-mla" />} />
      <Route path="/ar/bibliughrafia-chicago" component={() => <SeoRoute slug="ar/bibliughrafia-chicago" />} />
      <Route path="/ar/murajaat-adabiyya" component={() => <SeoRoute slug="ar/murajaat-adabiyya" />} />
      <Route path="/ar/risala-musaeada" component={() => <SeoRoute slug="ar/risala-musaeada" />} />
      <Route path="/ar/tullab" component={() => <SeoRoute slug="ar/tullab" />} />
      <Route path="/ar/bahithun" component={() => <SeoRoute slug="ar/bahithun" />} />

      {/* HE pages */}
      <Route path="/he/bibliographia-apa" component={() => <SeoRoute slug="he/bibliographia-apa" />} />
      <Route path="/he/bibliographia-vancouver" component={() => <SeoRoute slug="he/bibliographia-vancouver" />} />
      <Route path="/he/bibliographia-mla" component={() => <SeoRoute slug="he/bibliographia-mla" />} />
      <Route path="/he/bibliographia-chicago" component={() => <SeoRoute slug="he/bibliographia-chicago" />} />
      <Route path="/he/skirut-sifrut" component={() => <SeoRoute slug="he/skirut-sifrut" />} />
      <Route path="/he/avaoda-akademit" component={() => <SeoRoute slug="he/avaoda-akademit" />} />
      <Route path="/he/studentim" component={() => <SeoRoute slug="he/studentim" />} />
      <Route path="/he/hukrim" component={() => <SeoRoute slug="he/hukrim" />} />

      {/* HI pages */}
      <Route path="/hi/sandarbh-suchi-apa" component={() => <SeoRoute slug="hi/sandarbh-suchi-apa" />} />
      <Route path="/hi/sandarbh-suchi-vancouver" component={() => <SeoRoute slug="hi/sandarbh-suchi-vancouver" />} />
      <Route path="/hi/sandarbh-suchi-mla" component={() => <SeoRoute slug="hi/sandarbh-suchi-mla" />} />
      <Route path="/hi/sandarbh-suchi-chicago" component={() => <SeoRoute slug="hi/sandarbh-suchi-chicago" />} />
      <Route path="/hi/sahitya-samiksha" component={() => <SeoRoute slug="hi/sahitya-samiksha" />} />
      <Route path="/hi/shodh-prabandh-sahayata" component={() => <SeoRoute slug="hi/shodh-prabandh-sahayata" />} />
      <Route path="/hi/chhatr" component={() => <SeoRoute slug="hi/chhatr" />} />
      <Route path="/hi/shodharth" component={() => <SeoRoute slug="hi/shodharth" />} />

      {/* ZH pages */}
      <Route path="/zh/cankaowenxian-apa" component={() => <SeoRoute slug="zh/cankaowenxian-apa" />} />
      <Route path="/zh/cankaowenxian-vancouver" component={() => <SeoRoute slug="zh/cankaowenxian-vancouver" />} />
      <Route path="/zh/cankaowenxian-mla" component={() => <SeoRoute slug="zh/cankaowenxian-mla" />} />
      <Route path="/zh/cankaowenxian-chicago" component={() => <SeoRoute slug="zh/cankaowenxian-chicago" />} />
      <Route path="/zh/wenxian-zongshu" component={() => <SeoRoute slug="zh/wenxian-zongshu" />} />
      <Route path="/zh/lunwen-bangzhu" component={() => <SeoRoute slug="zh/lunwen-bangzhu" />} />
      <Route path="/zh/xuesheng" component={() => <SeoRoute slug="zh/xuesheng" />} />
      <Route path="/zh/yanjiu-ren-yuan" component={() => <SeoRoute slug="zh/yanjiu-ren-yuan" />} />

      {/* JA pages */}
      <Route path="/ja/sankoubunken-apa" component={() => <SeoRoute slug="ja/sankoubunken-apa" />} />
      <Route path="/ja/sankoubunken-vancouver" component={() => <SeoRoute slug="ja/sankoubunken-vancouver" />} />
      <Route path="/ja/sankoubunken-mla" component={() => <SeoRoute slug="ja/sankoubunken-mla" />} />
      <Route path="/ja/sankoubunken-chicago" component={() => <SeoRoute slug="ja/sankoubunken-chicago" />} />
      <Route path="/ja/bunken-chosa" component={() => <SeoRoute slug="ja/bunken-chosa" />} />
      <Route path="/ja/ronbun-support" component={() => <SeoRoute slug="ja/ronbun-support" />} />
      <Route path="/ja/gakusei" component={() => <SeoRoute slug="ja/gakusei" />} />
      <Route path="/ja/kenkyusha" component={() => <SeoRoute slug="ja/kenkyusha" />} />

      {/* KO pages */}
      <Route path="/ko/chamgomunheon-apa" component={() => <SeoRoute slug="ko/chamgomunheon-apa" />} />
      <Route path="/ko/chamgomunheon-vancouver" component={() => <SeoRoute slug="ko/chamgomunheon-vancouver" />} />
      <Route path="/ko/chamgomunheon-mla" component={() => <SeoRoute slug="ko/chamgomunheon-mla" />} />
      <Route path="/ko/chamgomunheon-chicago" component={() => <SeoRoute slug="ko/chamgomunheon-chicago" />} />
      <Route path="/ko/munheon-gochal" component={() => <SeoRoute slug="ko/munheon-gochal" />} />
      <Route path="/ko/nonmun-jiwon" component={() => <SeoRoute slug="ko/nonmun-jiwon" />} />
      <Route path="/ko/haksaeng" component={() => <SeoRoute slug="ko/haksaeng" />} />
      <Route path="/ko/yeongu-ja" component={() => <SeoRoute slug="ko/yeongu-ja" />} />

      {/* VI pages */}
      <Route path="/vi/tai-lieu-tham-khao-apa" component={() => <SeoRoute slug="vi/tai-lieu-tham-khao-apa" />} />
      <Route path="/vi/tai-lieu-tham-khao-vancouver" component={() => <SeoRoute slug="vi/tai-lieu-tham-khao-vancouver" />} />
      <Route path="/vi/tai-lieu-tham-khao-mla" component={() => <SeoRoute slug="vi/tai-lieu-tham-khao-mla" />} />
      <Route path="/vi/tai-lieu-tham-khao-chicago" component={() => <SeoRoute slug="vi/tai-lieu-tham-khao-chicago" />} />
      <Route path="/vi/tong-quan-tai-lieu" component={() => <SeoRoute slug="vi/tong-quan-tai-lieu" />} />
      <Route path="/vi/luan-van-ho-tro" component={() => <SeoRoute slug="vi/luan-van-ho-tro" />} />
      <Route path="/vi/sinh-vien" component={() => <SeoRoute slug="vi/sinh-vien" />} />
      <Route path="/vi/nha-nghien-cuu" component={() => <SeoRoute slug="vi/nha-nghien-cuu" />} />

      {/* ID pages */}
      <Route path="/id/daftar-pustaka-apa" component={() => <SeoRoute slug="id/daftar-pustaka-apa" />} />
      <Route path="/id/daftar-pustaka-vancouver" component={() => <SeoRoute slug="id/daftar-pustaka-vancouver" />} />
      <Route path="/id/daftar-pustaka-mla" component={() => <SeoRoute slug="id/daftar-pustaka-mla" />} />
      <Route path="/id/daftar-pustaka-chicago" component={() => <SeoRoute slug="id/daftar-pustaka-chicago" />} />
      <Route path="/id/tinjauan-pustaka" component={() => <SeoRoute slug="id/tinjauan-pustaka" />} />
      <Route path="/id/skripsi-bantuan" component={() => <SeoRoute slug="id/skripsi-bantuan" />} />
      <Route path="/id/mahasiswa" component={() => <SeoRoute slug="id/mahasiswa" />} />
      <Route path="/id/peneliti" component={() => <SeoRoute slug="id/peneliti" />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
