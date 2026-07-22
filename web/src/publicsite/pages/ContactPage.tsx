import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, CheckCircle2, Lock, Sparkles, Send, ShieldCheck } from "lucide-react";
import { SITE_CONTENT } from "../config/site-content";
import { schoolApi } from "../api/endpoints";
import { normalizeError } from "../api/error-normalizer";
import { Container, Section, SectionHeading, Breadcrumbs, Button } from "../components/common/UI";
import { ContactSubmission } from "../types";

// Zod schema enforcing either email or phone is required
const contactSchema = z
  .object({
    fullName: z.string().min(3, "Please enter your full name (at least 3 characters)."),
    email: z.string().email("Please enter a valid email address.").or(z.literal("")),
    phone: z.string().optional(),
    subject: z.string().min(4, "Please specify a subject (at least 4 characters)."),
    message: z.string().min(10, "Please enter your message (at least 10 characters)."),
    honeypot: z.string().optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email address or contact phone number is required.",
    path: ["email"], // attach error to email
  });

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const crumbs = [{ label: "Contact Us" }];
  const [success, setSuccess] = useState(false);

  // Set up React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      honeypot: "",
    },
  });

  // Query mutation for submitting contact form
  const mutation = useMutation({
    mutationFn: schoolApi.submitContact,
    onSuccess: (data) => {
      toast.success(data.message || "Your message has been submitted successfully!");
      setSuccess(true);
      reset();
    },
    onError: (error) => {
      const msg = normalizeError(error);
      toast.error(msg);
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    mutation.mutate(values as ContactSubmission);
  };

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Contact CARTA</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            Reach out directly to our admissions office, registrar desk, or principal administrative department.
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      <Section bg="white" id="contact-content">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Office details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A46FD]">
                Admissions Desk
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
                Get In Touch With Us
              </h2>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                Our desk officers are fully available during weekday morning hours. Please feel free to call, email, or schedule an administrative appointment.
              </p>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-[#172033] font-medium">
              <li className="flex gap-3.5 items-start">
                <MapPin className="w-5 h-5 text-[#019444] shrink-0 mt-0.5" />
                <span>{SITE_CONTENT.contact.address}</span>
              </li>
              <li className="flex gap-3.5 items-center">
                <Phone className="w-4.5 h-4.5 text-[#1A46FD] shrink-0" />
                <span>{SITE_CONTENT.contact.phone}</span>
              </li>
              <li className="flex gap-3.5 items-center">
                <Phone className="w-4.5 h-4.5 text-[#019444] shrink-0" />
                <span>{SITE_CONTENT.contact.phoneAlternative}</span>
              </li>
              <li className="flex gap-3.5 items-center">
                <Mail className="w-4.5 h-4.5 text-[#1A46FD] shrink-0" />
                <span>{SITE_CONTENT.contact.email}</span>
              </li>
            </ul>

            <div className="bg-[#F7F9FC] border border-[#E4E7EC] p-5 rounded-xl space-y-3">
              <div>
                <p className="text-xs font-bold text-[#172033] uppercase tracking-wider text-[#1A46FD] mb-1">
                  Office Hours
                </p>
                <p className="text-xs sm:text-sm text-[#667085] font-semibold">
                  {SITE_CONTENT.contact.officeHours}
                </p>
              </div>
              <div className="border-t border-[#E4E7EC] pt-2">
                <p className="text-xs font-bold text-[#019444] uppercase tracking-wider mb-1">
                  Directions
                </p>
                <p className="text-xs text-[#667085] leading-relaxed">
                  {SITE_CONTENT.contact.directions}
                </p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-7 border border-[#E4E7EC] rounded-2xl shadow-sm bg-white overflow-hidden">
            <div className="bg-[#1232B8] text-white p-5 sm:p-6 text-center">
              <h3 className="text-lg font-bold">Send an Email Message</h3>
              <p className="text-xs text-white/80">Submit your inquiries directly to our administrative desk.</p>
            </div>

            <div className="p-6 sm:p-8">
              {success ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-[#019444] mx-auto" />
                  <h3 className="text-lg font-bold text-[#172033]">Message Received!</h3>
                  <p className="text-xs sm:text-sm text-[#667085] max-w-sm mx-auto">
                    Thank you for your message. An admissions officer will respond to your email shortly.
                  </p>
                  <Button variant="primary" size="sm" onClick={() => setSuccess(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Honeypot */}
                  <div className="hidden">
                    <input {...register("honeypot")} type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033] block">Your Full Name *</label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                        errors.fullName ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                      }`}
                      placeholder="e.g. Marian Hussein"
                      {...register("fullName")}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-[#D92D20] font-semibold">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#172033] block">Email Address *</label>
                      <input
                        type="email"
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                          errors.email ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                        }`}
                        placeholder="e.g. user@example.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-[#D92D20] font-semibold">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#172033] block">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2.5 rounded-lg border border-[#E4E7EC] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A46FD]"
                        placeholder="e.g. +252 61 555 1234"
                        {...register("phone")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033] block">Subject *</label>
                    <input
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                        errors.subject ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                      }`}
                      placeholder="e.g. Admission Seat Availability"
                      {...register("subject")}
                    />
                    {errors.subject && (
                      <p className="text-[11px] text-[#D92D20] font-semibold">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033] block">Your Message *</label>
                    <textarea
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                        errors.message ? "border-[#D92D20] focus:ring-[#D92D20]" : "border-[#E4E7EC] focus:ring-[#1A46FD]"
                      }`}
                      rows={5}
                      placeholder="Enter your message details clearly..."
                      {...register("message")}
                    ></textarea>
                    {errors.message && (
                      <p className="text-[11px] text-[#D92D20] font-semibold">{errors.message.message}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E4E7EC] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#667085] font-semibold">
                      <ShieldCheck className="w-4.5 h-4.5 text-[#019444]" />
                      <span>Administrative Submission Panel</span>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      loading={mutation.isPending}
                      icon={<Send className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                    >
                      Send Message
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
