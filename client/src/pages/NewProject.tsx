import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile, useUpsertProfile } from "@/hooks/use-profiles";
import { useCreateProject } from "@/hooks/use-projects";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

const DOMAIN_KEYS = [
  "soins_infirmiers", "travail_social", "management", "rh", "economie",
  "marketing", "droit", "education", "psychologie", "informatique",
  "data_ia", "logistique", "qualite", "comptabilite", "banque",
  "immobilier", "sciences_politiques", "environnement", "industrie", "autre",
];

const DEGREE_LEVEL_KEYS = [
  "bts_dut", "licence", "bachelor", "master1", "master2",
  "mba", "diplome_etat", "doctorat", "vae", "autre",
];

const USER_PROFILE_KEYS = [
  "etudiant_sans_stage", "etudiant_stage", "etudiant_alternance",
  "professionnel", "professionnel_sante", "candidat_vae",
];

const STRUCTURE_TYPE_KEYS = [
  "hopital", "entreprise_privee", "association", "administration", "autre",
];

const PROJECT_TYPE_KEYS = ["memoire", "tfe", "vae", "rapport_stage", "these"];

const FINALITY_KEYS = ["academique", "professionnelle", "mixte"];

const APPROACH_KEYS = ["theorique", "appliquee", "analyse_pratiques", "etude_cas", "ne_sais_pas"];

const step1Schema = z.object({
  name: z.string().min(2, "required"),
  type: z.string().min(1, "required"),
  language: z.string().default("Français"),
});

const step2Schema = z.object({
  mainDomain: z.string().min(1, "required"),
  mainDomainOther: z.string().optional(),
  degreeLevel: z.string().min(1, "required"),
  degreeTitle: z.string().min(2, "required"),
}).superRefine((data, ctx) => {
  if (data.mainDomain === "autre" && (!data.mainDomainOther || data.mainDomainOther.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "required", path: ["mainDomainOther"] });
  }
});

const step3Schema = z.object({
  userProfile: z.string().min(1, "required"),
  workDomain: z.string().optional(),
  workFunction: z.string().optional(),
  workStructure: z.string().optional(),
}).superRefine((data, ctx) => {
  const needsWork = showWorkFields(data.userProfile);
  if (needsWork && (!data.workDomain || data.workDomain.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "required", path: ["workDomain"] });
  }
  if (needsWork && (!data.workFunction || data.workFunction.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "required", path: ["workFunction"] });
  }
  if (needsWork && (!data.workStructure || data.workStructure.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "required", path: ["workStructure"] });
  }
});

const step4Schema = z.object({
  finality: z.string().min(1, "required"),
  approach: z.string().min(1, "required"),
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
  const { t } = useI18n();

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

  const stepLabels = [
    t("newProject.stepProject"),
    t("newProject.stepContext"),
    t("newProject.stepProfile"),
    t("newProject.stepOrientation"),
  ];

  return (
    <Layout>
      <SEO titleKey="seo.newProjectTitle" />
      <div className="max-w-2xl mx-auto py-8">
        <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : setLocation('/')} className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 w-4 h-4" />
          {step > 1 ? t("newProject.back") : t("dashboard.title")}
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
                  <CardTitle>{t("newProject.projectDetails")}</CardTitle>
                  <CardDescription>{t("newProject.projectDetailsDesc")}</CardDescription>
                </CardHeader>
                <Form {...form1}>
                  <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-6">
                    <FormField control={form1.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("newProject.projectName")}</FormLabel>
                        <FormControl><Input placeholder={t("newProject.projectNamePlaceholder")} {...field} data-testid="input-project-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form1.control} name="type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("newProject.workType")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger data-testid="select-project-type"><SelectValue placeholder={t("newProject.select")} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {PROJECT_TYPE_KEYS.map(key => <SelectItem key={key} value={key}>{t(`projectTypes.${key}` as any)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form1.control} name="language" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("newProject.language")}</FormLabel>
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
                      <Button type="submit" data-testid="button-next-step1">{t("newProject.next")} <ArrowRight className="ml-2 w-4 h-4" /></Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>{t("newProject.academicContext")}</CardTitle>
                  <CardDescription>{t("newProject.academicContextDesc")}</CardDescription>
                </CardHeader>
                <Form {...form2}>
                  <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-6">
                    <FormField control={form2.control} name="mainDomain" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("newProject.mainDomain")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-domain"><SelectValue placeholder={t("newProject.selectDomain")} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {DOMAIN_KEYS.map(key => <SelectItem key={key} value={key}>{t(`domains.${key}` as any)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {form2.watch("mainDomain") === "autre" && (
                      <FormField control={form2.control} name="mainDomainOther" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("newProject.specifyDomain")}</FormLabel>
                          <FormControl><Input placeholder={t("newProject.specifyDomainPlaceholder")} {...field} data-testid="input-domain-other" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form2.control} name="degreeLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("newProject.degree")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger data-testid="select-degree"><SelectValue placeholder={t("newProject.degreeLevel")} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {DEGREE_LEVEL_KEYS.map(key => <SelectItem key={key} value={key}>{t(`degreeLevels.${key}` as any)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form2.control} name="degreeTitle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("newProject.degreeTitle")}</FormLabel>
                          <FormControl><Input placeholder={t("newProject.degreeTitlePlaceholder")} {...field} data-testid="input-degree-title" /></FormControl>
                          <FormDescription className="text-xs">{t("newProject.degreeTitleHint")}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" data-testid="button-next-step2">{t("newProject.next")} <ArrowRight className="ml-2 w-4 h-4" /></Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>{t("newProject.userProfile")}</CardTitle>
                  <CardDescription>{t("newProject.userProfileDesc")}</CardDescription>
                </CardHeader>
                <Form {...form3}>
                  <form onSubmit={form3.handleSubmit(onStep3)} className="space-y-6">
                    <FormField control={form3.control} name="userProfile" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("newProject.yourSituation")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-profile"><SelectValue placeholder={t("newProject.select")} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {USER_PROFILE_KEYS.map(key => <SelectItem key={key} value={key}>{t(`userProfiles.${key}` as any)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {showWorkFields(watchProfile) && (
                      <div className="space-y-4 animate-in fade-in duration-300 border-l-2 border-primary/30 pl-4">
                        <FormField control={form3.control} name="workDomain" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("newProject.workDomain")}</FormLabel>
                            <FormControl><Input placeholder={t("newProject.workDomainPlaceholder")} {...field} data-testid="input-work-domain" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form3.control} name="workFunction" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("newProject.workFunction")}</FormLabel>
                            <FormControl><Input placeholder={t("newProject.workFunctionPlaceholder")} {...field} data-testid="input-work-function" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form3.control} name="workStructure" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("newProject.structureType")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger data-testid="select-structure"><SelectValue placeholder={t("newProject.select")} /></SelectTrigger></FormControl>
                              <SelectContent>
                                {STRUCTURE_TYPE_KEYS.map(key => <SelectItem key={key} value={key}>{t(`structureTypes.${key}` as any)}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button type="submit" data-testid="button-next-step3">{t("newProject.next")} <ArrowRight className="ml-2 w-4 h-4" /></Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>{t("newProject.orientation")}</CardTitle>
                  <CardDescription>{t("newProject.orientationDesc")}</CardDescription>
                </CardHeader>
                <Form {...form4}>
                  <form onSubmit={form4.handleSubmit(onStep4)} className="space-y-6">
                    <FormField control={form4.control} name="finality" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("newProject.finality")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-finality"><SelectValue placeholder={t("newProject.select")} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {FINALITY_KEYS.map(key => <SelectItem key={key} value={key}>{t(`finalities.${key}` as any)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form4.control} name="approach" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("newProject.approachType")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-approach"><SelectValue placeholder={t("newProject.select")} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {APPROACH_KEYS.map(key => <SelectItem key={key} value={key}>{t(`approaches.${key}` as any)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isCreating} data-testid="button-create-project">
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        {t("newProject.createProject")}
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
