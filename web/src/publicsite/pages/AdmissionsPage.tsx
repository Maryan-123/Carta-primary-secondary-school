import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CheckCircle2, Clock, Calendar, ArrowRight, ShieldCheck, Mail, Phone, Lock, Sparkles } from "lucide-react";
import { SITE_CONTENT } from "../config/site-content";
import { schoolApi } from "../api/endpoints";
import { normalizeError } from "../api/error-normalizer";
import { Container, Section, SectionHeading, Breadcrumbs, Button } from "../components/common/UI";
import { AdmissionInquiry } from "../types";

// Zod Schema matching form specs
const inquirySchema = z.object({
  parentFullName: z.string().min(3, "Parent full name must be at least 3 characters."),
  phone: z.string().min(8, "Valid contact phone number is required."),
  alternativePhone: z.string().optional(),
  email: z.string().email("Please enter a valid email address.").or(z.literal("")),
  studentFullName: z.string().min(3, "Student full name must be at least 3 characters."),
  studentDateOfBirth: z.string().min(1, "Student date of birth is required."),
  desiredLevel: z.string().min(1, "Please select a desired grade level."),
  previousSchool: z.string().optional(),
  preferredStartTerm: z.string().min(1, "Please select your preferred start term."),
  message: z.string().max(500, "Message cannot exceed 500 characters.").optional(),
  consentCheckbox: z.boolean().refine((val) => val === true, "You must consent to CARTA's data policy."),
  honeypot: z.string().optional(), // Spam honeypot
});

type FormValues = z.infer<typeof inquirySchema>;

export default function AdmissionsPage() {
  const crumbs = [{ label: "Admissions" }];
  const [success, setSuccess] = useState(false);

  // Set up React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      parentFullName: "",
      phone: "",
      alternativePhone: "",
      email: "",
      studentFullName: "",
      studentDateOfBirth: "",
      desiredLevel: "",
      previousSchool: "",
      preferredStartTerm: "",
      message: "",
      consentCheckbox: false,
      honeypot: "",
    },
  });

  // Query mutation for submitting
  const mutation = useMutation({
    mutationFn: schoolApi.submitAdmissionInquiry,
    onSuccess: (data) => {
      toast.success(data.message || "Admission inquiry submitted successfully!");
      setSuccess(true);
      reset();
    },
    onError: (error) => {
      const msg = normalizeError(error);
      toast.error(msg);
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values as AdmissionInquiry);
  };

  return (
    <div>
      {/* 1. Admissions Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">{SITE_CONTENT.admissions.title}</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            {SITE_CONTENT.admissions.intro}
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      {/* 2. Steps Process */}
      <Section bg="white" id="process">
        <Container>
          <SectionHeading
            title="The Admission Process"
            subtitle="Follow these clear, administrative steps to register your child at CARTA Primary & Secondary School."
            badge="Step-by-step Guide"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SITE_CONTENT.admissions.steps.map((step) => (
              <div
                key={step.step}
                className="bg-[#F7F9FC] border border-[#E4E7EC] hover:border-[#1A46FD] rounded-xl p-6 space-y-4 transition-colors shadow-sm relative group"
              >
                <div className="absolute top-4 right-4 text-3xl font-black text-gray-200 group-hover:text-[#1A46FD]/10 select-none">
                  0{step.step}
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#EAF0FF] text-[#1A46FD] font-bold flex items-center justify-center border border-[#1A46FD]/10">
                  {step.step}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#172033]">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3. Requirements */}
      <Section bg="neutral" id="requirements">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#019444]">
              Mandatory Entries
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
              Required Documentation
            </h2>
            <p className="text-sm text-[#667085] leading-relaxed">
              Please ensure certified copies of all specified documents are prepared before initiating placement interviews. Original passports or local birth registries will be requested by the registrar for direct validation on campus.
            </p>
            <div className="bg-white border border-[#E4E7EC] p-4 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#019444] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#172033]">No Online Application Fees</p>
                <p className="text-xs text-[#667085]">CARTA never requests payments through online inboxes. Payment channels are shared privately after in-person validation.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#E4E7EC] p-6 sm:p-8 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-[#172033] mb-4">Admissions Checklist</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SITE_CONTENT.admissions.requirements.map((req, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs sm:text-sm text-[#667085] leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#019444] shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* 4. Inquiry Form */}
      <Section bg="white" id="inquiry-form">
        <Container className="max-w-4xl">
          <div className="border border-[#E4E7EC] rounded-2xl overflow-hidden shadow-md bg-white">
            <div className="bg-[#1232B8] text-white p-6 sm:p-8 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-[#019444] mx-auto animate-pulse-slow" />
              <h2 className="text-xl sm:text-2xl font-bold">Admission Inquiry Form</h2>
              <p className="text-xs sm:text-sm text-white/80">
                Submit an inquiry to schedule placement testing or check grade seat availabilities.
              </p>
            </div>

            <div className="p-6 sm:p-10">
              {success ? (
                <div className="text-center py-10 space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-[#019444] mx-auto" />
                  <h3 className="text-xl font-bold text-[#172033]">Inquiry Submitted!</h3>
                  <p className="text-sm text-[#667085] max-w-md mx-auto">
                    Your admissions inquiry has been recorded successfully. Our desk registrar will reach out to you within 2-3 working days.
                  </p>
                  <Button variant="primary" onClick={() => setSuccess(false)}>
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Spam Protection Honeypot */}
                  <div className="hidden">
                    <label htmlFor="honeypot">Leave blank</label>
                    <input id="honeypot" {...register("honeypot")} type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  {/* Guardian section */}
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1A46FD] border-b border-[#E4E7EC] pb-2 mb-4">
                      Guardian / Parent Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#172033] block">Guardian Full Name *</label>
                        <input
                          type="text"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                            errors.parentFullName ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                          }`}
                          placeholder="e.g. Hassan Ahmed Ali"
                          {...register("parentFullName")}
                        />
                        {errors.parentFullName && (
                          <p className="text-[11px] text-[#D92D20] font-semibold">{errors.parentFullName.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#172033] block">Contact Phone Number *</label>
                        <input
                          type="tel"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                            errors.phone ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                          }`}
                          placeholder="e.g. +252 61 555 1234"
                          {...register("phone")}
                        />
                        {errors.phone && (
                          <p className="text-[11px] text-[#D92D20] font-semibold">{errors.phone.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#172033] block">Alternative Phone (Optional)</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2.5 rounded-lg border border-[#E4E7EC] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A46FD]"
                          placeholder="e.g. +252 61 555 5678"
                          {...register("alternativePhone")}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#172033] block">Email Address (Optional)</label>
                        <input
                          type="email"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                            errors.email ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                          }`}
                          placeholder="e.g. parent@example.com"
                          {...register("email")}
                        />
                        {errors.email && (
                          <p className="text-[11px] text-[#D92D20] font-semibold">{errors.email.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Student details */}
                  <div className="pt-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#019444] border-b border-[#E4E7EC] pb-2 mb-4">
                      Prospective Student Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-xs font-bold text-[#172033] block">Student Full Name *</label>
                        <input
                          type="text"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                            errors.studentFullName ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                          }`}
                          placeholder="e.g. Ahmed Hassan Ahmed"
                          {...register("studentFullName")}
                        />
                        {errors.studentFullName && (
                          <p className="text-[11px] text-[#D92D20] font-semibold">{errors.studentFullName.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#172033] block">Date of Birth *</label>
                        <input
                          type="date"
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                            errors.studentDateOfBirth ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                          }`}
                          {...register("studentDateOfBirth")}
                        />
                        {errors.studentDateOfBirth && (
                          <p className="text-[11px] text-[#D92D20] font-semibold">{errors.studentDateOfBirth.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#172033] block">Desired Grade Level *</label>
                        <select
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 ${
                            errors.desiredLevel ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                          }`}
                          {...register("desiredLevel")}
                        >
                          <option value="">Select Level</option>
                          {SITE_CONTENT.admissions.levels.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                        {errors.desiredLevel && (
                          <p className="text-[11px] text-[#D92D20] font-semibold">{errors.desiredLevel.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#172033] block">Previous School (Optional)</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 rounded-lg border border-[#E4E7EC] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A46FD]"
                          placeholder="e.g. Mogadishu Community School"
                          {...register("previousSchool")}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#172033] block">Preferred Start Term *</label>
                        <select
                          className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 ${
                            errors.preferredStartTerm ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                          }`}
                          {...register("preferredStartTerm")}
                        >
                          <option value="">Select Term</option>
                          {SITE_CONTENT.admissions.terms.map((term) => (
                            <option key={term} value={term}>
                              {term}
                            </option>
                          ))}
                        </select>
                        {errors.preferredStartTerm && (
                          <p className="text-[11px] text-[#D92D20] font-semibold">{errors.preferredStartTerm.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message & consent */}
                  <div className="space-y-4 pt-4 border-t border-[#E4E7EC]">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#172033] block">Additional Notes or Message</label>
                      <textarea
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                          errors.message ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                        }`}
                        rows={4}
                        placeholder="Share any special needs, transfer guidelines or questions..."
                        {...register("message")}
                      ></textarea>
                      {errors.message && (
                        <p className="text-[11px] text-[#D92D20] font-semibold">{errors.message.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <input
                          id="consent"
                          type="checkbox"
                          className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-[#1A46FD] focus:ring-[#1A46FD]"
                          {...register("consentCheckbox")}
                        />
                        <label htmlFor="consent" className="text-xs text-[#667085] leading-relaxed select-none">
                          I certify that all details submitted are accurate and I consent to CARTA School using this information to process admissions inquiries. I understand that registering this inquiry does not constitute a guaranteed seat.
                        </label>
                      </div>
                      {errors.consentCheckbox && (
                        <p className="text-[11px] text-[#D92D20] font-semibold">{errors.consentCheckbox.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E4E7EC] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-[#667085] font-semibold">
                      <Lock className="w-4 h-4 text-[#019444]" />
                      <span>Secured connection. Your private details are never sold or shared.</span>
                    </div>

                    <Button
                      type="submit"
                      variant="success"
                      loading={mutation.isPending}
                      className="w-full sm:w-auto px-8"
                    >
                      Submit Inquiry
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
