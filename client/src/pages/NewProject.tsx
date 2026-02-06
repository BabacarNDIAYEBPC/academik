import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, insertProfileSchema } from "@shared/schema";
import { useProfile, useUpsertProfile } from "@/hooks/use-profiles";
import { useCreateProject } from "@/hooks/use-projects";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Step 1 Schema
const step1Schema = insertProjectSchema.pick({
  name: true,
  type: true,
  language: true,
});

// Step 2 Schema (Profile)
const step2Schema = insertProfileSchema.pick({
  domain: true,
  educationLevel: true,
  educationTitle: true,
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export default function NewProject() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { mutateAsync: upsertProfile } = useUpsertProfile();
  const { mutateAsync: createProject, isPending: isCreating } = useCreateProject();

  const [projectData, setProjectData] = useState<Partial<Step1Data>>({});

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
      type: "memoire",
      language: "Français",
    },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      domain: "",
      educationLevel: "",
      educationTitle: "",
    },
  });

  // Pre-fill profile form if data exists
  useEffect(() => {
    if (profile) {
      form2.reset({
        domain: profile.domain || "",
        educationLevel: profile.educationLevel || "",
        educationTitle: profile.educationTitle || "",
      });
    }
  }, [profile, form2]);

  const onStep1Submit = (data: Step1Data) => {
    setProjectData(data);
    setStep(2);
  };

  const onStep2Submit = async (data: Step2Data) => {
    try {
      // 1. Update Profile context if changed or new
      await upsertProfile({
        ...profile, // keep existing fields
        ...data,    // overwrite with new
      });

      // 2. Create Project
      const project = await createProject({
        ...projectData as Step1Data,
        // Add orientation/context defaults if needed, or leave for later
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <Button variant="ghost" onClick={() => step > 1 ? setStep(1) : setLocation('/')} className="mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          {step > 1 ? "Back" : "Dashboard"}
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
          <div className="h-1 flex-1 bg-muted">
            <div className={`h-full bg-primary transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                <h2 className="text-2xl font-bold mb-6">Project Details</h2>
                <Form {...form1}>
                  <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-6">
                    <FormField
                      control={form1.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Impact of AI on Education" {...field} className="h-12 text-lg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form1.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="memoire">Mémoire</SelectItem>
                                <SelectItem value="tfe">TFE</SelectItem>
                                <SelectItem value="vae">VAE</SelectItem>
                                <SelectItem value="rapport_stage">Rapport de Stage</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form1.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Français">Français</SelectItem>
                                <SelectItem value="English">English</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" size="lg">
                        Next Step
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                <h2 className="text-2xl font-bold mb-2">Academic Context</h2>
                <p className="text-muted-foreground mb-6">Tell us about your field of study to get better AI suggestions.</p>
                
                <Form {...form2}>
                  <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
                    <FormField
                      control={form2.control}
                      name="domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain of Study</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select domain" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="computer_science">Computer Science</SelectItem>
                              <SelectItem value="economics">Economics & Management</SelectItem>
                              <SelectItem value="psychology">Psychology</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="law">Law</SelectItem>
                              <SelectItem value="engineering">Engineering</SelectItem>
                              <SelectItem value="health">Health Sciences</SelectItem>
                              <SelectItem value="arts">Arts & Humanities</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form2.control}
                        name="educationLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bachelor">Bachelor (Licence)</SelectItem>
                                <SelectItem value="master1">Master 1</SelectItem>
                                <SelectItem value="master2">Master 2</SelectItem>
                                <SelectItem value="phd">PhD (Doctorat)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form2.control}
                        name="educationTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specific Degree Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Master in Digital Marketing" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" size="lg" disabled={isCreating}>
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        Create Project
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
