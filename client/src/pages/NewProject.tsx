import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile, useUpsertProfile } from "@/hooks/use-profiles";
import { useCreateProject } from "@/hooks/use-projects";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

const DOMAINS = [
  { value: "soins_infirmiers", label: "Soins infirmiers / Santé" },
  { value: "travail_social", label: "Travail social" },
  { value: "management", label: "Management / Gestion" },
  { value: "rh", label: "Ressources humaines" },
  { value: "economie", label: "Économie / Finance" },
  { value: "marketing", label: "Marketing / Communication" },
  { value: "droit", label: "Droit / Administration publique" },
  { value: "education", label: "Éducation / Pédagogie" },
  { value: "psychologie", label: "Psychologie" },
  { value: "informatique", label: "Informatique / Numérique" },
  { value: "data_ia", label: "Data / Intelligence artificielle" },
  { value: "logistique", label: "Logistique / Supply chain" },
  { value: "qualite", label: "Qualité / QHSE" },
  { value: "comptabilite", label: "Comptabilité / Audit / Contrôle de gestion" },
  { value: "banque", label: "Banque / Assurance" },
  { value: "immobilier", label: "Immobilier / Urbanisme" },
  { value: "sciences_politiques", label: "Sciences politiques / Relations internationales" },
  { value: "environnement", label: "Environnement / Développement durable" },
  { value: "industrie", label: "Industrie / Génie industriel" },
  { value: "autre", label: "Autre" },
];

const DEGREE_LEVELS = [
  { value: "bts_dut", label: "BTS / DUT" },
  { value: "licence", label: "Licence / Licence professionnelle" },
  { value: "bachelor", label: "Bachelor" },
  { value: "master1", label: "Master 1" },
  { value: "master2", label: "Master 2" },
  { value: "mba", label: "MBA" },
  { value: "diplome_etat", label: "Diplôme d'État (santé / social)" },
  { value: "doctorat", label: "Doctorat" },
  { value: "vae", label: "VAE" },
  { value: "autre", label: "Autre" },
];

const USER_PROFILES = [
  { value: "etudiant_sans_stage", label: "Étudiant sans stage" },
  { value: "etudiant_stage", label: "Étudiant en stage" },
  { value: "etudiant_alternance", label: "Étudiant en alternance" },
  { value: "professionnel", label: "Professionnel" },
  { value: "professionnel_sante", label: "Professionnel de santé" },
  { value: "candidat_vae", label: "Candidat VAE" },
];

const STRUCTURE_TYPES = [
  { value: "hopital", label: "Hôpital / Clinique" },
  { value: "entreprise_privee", label: "Entreprise privée" },
  { value: "association", label: "Association" },
  { value: "administration", label: "Administration publique" },
  { value: "autre", label: "Autre" },
];

const PROJECT_TYPES = [
  { value: "memoire", label: "Mémoire" },
  { value: "tfe", label: "TFE (Travail de Fin d'Études)" },
  { value: "vae", label: "VAE (Validation des Acquis)" },
  { value: "rapport_stage", label: "Rapport de Stage" },
  { value: "these", label: "Thèse (Doctorat)" },
];

const step1Schema = z.object({
  name: z.string().min(2, "Le nom du projet est requis"),
  type: z.string().min(1, "Le type est requis"),
  language: z.string().default("Français"),
});

const step2Schema = z.object({
  mainDomain: z.string().min(1, "Le domaine est requis"),
  mainDomainOther: z.string().optional(),
  degreeLevel: z.string().min(1, "Le niveau est requis"),
  degreeTitle: z.string().min(2, "L'intitulé de la formation est requis"),
}).superRefine((data, ctx) => {
  if (data.mainDomain === "autre" && (!data.mainDomainOther || data.mainDomainOther.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Précisez le domaine", path: ["mainDomainOther"] });
  }
});

const step3Schema = z.object({
  userProfile: z.string().min(1, "Le profil est requis"),
  workDomain: z.string().optional(),
  workFunction: z.string().optional(),
  workStructure: z.string().optional(),
}).superRefine((data, ctx) => {
  const needsWork = showWorkFields(data.userProfile);
  if (needsWork && (!data.workDomain || data.workDomain.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Le domaine du poste est requis", path: ["workDomain"] });
  }
  if (needsWork && (!data.workFunction || data.workFunction.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La fonction est requise", path: ["workFunction"] });
  }
  if (needsWork && (!data.workStructure || data.workStructure.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Le type de structure est requis", path: ["workStructure"] });
  }
});

const step4Schema = z.object({
  finality: z.string().min(1, "La finalité est requise"),
  approach: z.string().min(1, "L'approche est requise"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;

const TOTAL_STEPS = 4;

const showWorkFields = (profile: string) =>
  ["etudiant_stage", "etudiant_alternance", "professionnel", "professionnel_sante", "candidat_vae"].includes(profile);

export default function NewProject() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { data: existingProfile, isLoading: isProfileLoading } = useProfile();
  const { mutateAsync: upsertProfile } = useUpsertProfile();
  const { mutateAsync: createProject, isPending: isCreating } = useCreateProject();

  const [collected, setCollected] = useState<Record<string, any>>({});

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: "", type: "memoire", language: "Français" },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { mainDomain: "", mainDomainOther: "", degreeLevel: "", degreeTitle: "" },
  });

  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { userProfile: "", workDomain: "", workFunction: "", workStructure: "" },
  });

  const form4 = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: { finality: "academique", approach: "appliquee" },
  });

  useEffect(() => {
    if (existingProfile) {
      form2.reset({
        mainDomain: existingProfile.domain || "",
        mainDomainOther: existingProfile.domainOther || "",
        degreeLevel: existingProfile.educationLevel || "",
        degreeTitle: existingProfile.educationTitle || "",
      });
      form3.reset({
        userProfile: existingProfile.userProfileType || "",
        workDomain: existingProfile.workDomain || "",
        workFunction: existingProfile.workFunction || "",
        workStructure: existingProfile.structureType || "",
      });
    }
  }, [existingProfile]);

  const watchProfile = form3.watch("userProfile");

  const onStep1 = (data: Step1Data) => {
    setCollected(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const onStep2 = (data: Step2Data) => {
    setCollected(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const onStep3 = (data: Step3Data) => {
    setCollected(prev => ({ ...prev, ...data }));
    setStep(4);
  };

  const onStep4 = async (data: Step4Data) => {
    const all = { ...collected, ...data };
    try {
      await upsertProfile({
        domain: all.mainDomain,
        domainOther: all.mainDomainOther || undefined,
        educationLevel: all.degreeLevel,
        educationTitle: all.degreeTitle,
        userProfileType: all.userProfile,
        workDomain: all.workDomain || undefined,
        workFunction: all.workFunction || undefined,
        structureType: all.workStructure || undefined,
      });

      const project = await createProject({
        name: all.name,
        type: all.type,
        language: all.language,
        mainDomain: all.mainDomain,
        mainDomainOther: all.mainDomainOther || undefined,
        degreeLevel: all.degreeLevel,
        degreeTitle: all.degreeTitle,
        userProfile: all.userProfile,
        workDomain: all.workDomain || undefined,
        workFunction: all.workFunction || undefined,
        workStructure: all.workStructure || undefined,
        finality: all.finality,
        approach: all.approach,
      });

      setLocation(`/projects/${project.id}`);
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  if (isProfileLoading) {
    return (
      <Layout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const stepLabels = ["Projet", "Contexte", "Profil", "Orientation"];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : setLocation('/')} className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 w-4 h-4" />
          {step > 1 ? "Retour" : "Dashboard"}
        </Button>

        <div className="flex items-center gap-2 mb-8">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                step > i + 1 ? 'bg-primary text-primary-foreground' :
                step === i + 1 ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                'bg-muted text-muted-foreground'
              }`} data-testid={`step-indicator-${i+1}`}>{i + 1}</div>
              <span className={`text-xs hidden sm:block ${step >= i + 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
              {i < TOTAL_STEPS - 1 && <div className="h-0.5 flex-1 bg-muted"><div className={`h-full bg-primary transition-all ${step > i + 1 ? 'w-full' : 'w-0'}`} /></div>}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Détails du projet</CardTitle>
                  <CardDescription>Nommez votre projet et choisissez le type de travail.</CardDescription>
                </CardHeader>
                <Form {...form1}>
                  <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-6">
                    <FormField control={form1.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du projet</FormLabel>
                        <FormControl><Input placeholder="Ex: Impact du numérique sur les soins" {...field} data-testid="input-project-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form1.control} name="type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de travail</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger data-testid="select-project-type"><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {PROJECT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form1.control} name="language" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Langue</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger data-testid="select-language"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Français">Français</SelectItem>
                              <SelectItem value="English">English</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" data-testid="button-next-step1">Suivant <ArrowRight className="ml-2 w-4 h-4" /></Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Contexte académique</CardTitle>
                  <CardDescription>Ces informations conditionnent toutes les propositions de l'IA.</CardDescription>
                </CardHeader>
                <Form {...form2}>
                  <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-6">
                    <FormField control={form2.control} name="mainDomain" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domaine principal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-domain"><SelectValue placeholder="Sélectionner le domaine" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {DOMAINS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {form2.watch("mainDomain") === "autre" && (
                      <FormField control={form2.control} name="mainDomainOther" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Précisez le domaine</FormLabel>
                          <FormControl><Input placeholder="Ex: Ergothérapie" {...field} data-testid="input-domain-other" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form2.control} name="degreeLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formation / Diplôme</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger data-testid="select-degree"><SelectValue placeholder="Niveau" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {DEGREE_LEVELS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form2.control} name="degreeTitle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intitulé exact</FormLabel>
                          <FormControl><Input placeholder="Ex: Master 2 RH" {...field} data-testid="input-degree-title" /></FormControl>
                          <FormDescription className="text-xs">Ex: IFSI, Master 2 RH, Licence Management</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" data-testid="button-next-step2">Suivant <ArrowRight className="ml-2 w-4 h-4" /></Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Profil utilisateur</CardTitle>
                  <CardDescription>Dites-nous en plus sur votre situation actuelle.</CardDescription>
                </CardHeader>
                <Form {...form3}>
                  <form onSubmit={form3.handleSubmit(onStep3)} className="space-y-6">
                    <FormField control={form3.control} name="userProfile" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Votre situation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-profile"><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {USER_PROFILES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {showWorkFields(watchProfile) && (
                      <div className="space-y-4 animate-in fade-in duration-300 border-l-2 border-primary/30 pl-4">
                        <FormField control={form3.control} name="workDomain" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Domaine du poste</FormLabel>
                            <FormControl><Input placeholder="Ex: Service de réanimation" {...field} data-testid="input-work-domain" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form3.control} name="workFunction" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fonction occupée</FormLabel>
                            <FormControl><Input placeholder="Ex: Infirmier(e) diplômé(e) d'État" {...field} data-testid="input-work-function" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form3.control} name="workStructure" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type de structure</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger data-testid="select-structure"><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {STRUCTURE_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button type="submit" data-testid="button-next-step3">Suivant <ArrowRight className="ml-2 w-4 h-4" /></Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Orientation du travail</CardTitle>
                  <CardDescription>Dernière étape avant de créer votre projet.</CardDescription>
                </CardHeader>
                <Form {...form4}>
                  <form onSubmit={form4.handleSubmit(onStep4)} className="space-y-6">
                    <FormField control={form4.control} name="finality" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Finalité principale</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-finality"><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="academique">Académique</SelectItem>
                            <SelectItem value="professionnelle">Professionnelle</SelectItem>
                            <SelectItem value="mixte">Mixte</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form4.control} name="approach" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type d'approche attendue</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-approach"><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="theorique">Théorique</SelectItem>
                            <SelectItem value="appliquee">Appliquée</SelectItem>
                            <SelectItem value="analyse_pratiques">Analyse de pratiques</SelectItem>
                            <SelectItem value="etude_cas">Étude de cas</SelectItem>
                            <SelectItem value="ne_sais_pas">Je ne sais pas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isCreating} data-testid="button-create-project">
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        Créer le projet
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
