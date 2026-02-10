import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Tomi",
  description: "Tomi Homes, Inc. Privacy Policy — how we collect, use, disclose, and safeguard your information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tomi Homes, Inc.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Effective Date: January 1, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <p>
          Tomi Homes, Inc. (&ldquo;Tomi,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) values your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit{" "}
          <a href="https://livetomi.com" className="text-primary underline underline-offset-2 hover:text-primary/80">
            https://livetomi.com
          </a>{" "}
          (the &ldquo;Site&rdquo;) or engage with our products and services.
        </p>
        <p>
          This Privacy Policy applies to all users of the Site and all products and services offered by Tomi Homes, Inc.
        </p>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Information We Collect</h2>
          <p className="mb-3">We may collect the following categories of information:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Personal information you voluntarily provide, including name, email address, phone number, and other contact details</li>
            <li>Information submitted through forms, onboarding flows, scheduling tools, surveys, or communications</li>
            <li>Information related to shared homeownership planning, coordination preferences, financial assumptions, or other inputs you choose to provide</li>
            <li>Non-personal information such as browser type, device information, operating system, IP address, and website usage data</li>
          </ul>
          <p className="mt-3">
            You may browse the Site without providing personal information, but certain features or services may not be available.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">How We Use Your Information</h2>
          <p className="mb-3">We use collected information to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Provide, operate, and improve Tomi&apos;s services</li>
            <li>Facilitate consultations, coordination, modeling, and educational resources related to shared homeownership</li>
            <li>Respond to inquiries and communicate with you about services, updates, or resources you request</li>
            <li>Facilitate introductions to independent third-party service providers when requested by you or reasonably necessary to support the services you engage Tomi to provide</li>
            <li>Analyze usage trends and improve user experience</li>
            <li>Comply with applicable legal obligations</li>
          </ul>
          <p className="mt-3">Tomi does not sell personal information.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">AI-Assisted and Automated Processing</h2>
          <p>
            Some Tomi services may use software tools, including AI-assisted systems, to help organize information, analyze inputs, generate summaries, or support coordination workflows.
          </p>
          <p className="mt-3">
            These tools are used to assist users and do not replace professional legal, financial, tax, lending, or real estate advice. Outputs are informational only and should not be relied upon as definitive or professional guidance.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Sharing of Information and Professional Introductions</h2>
          <p className="mb-3">We may share personal information in the following circumstances:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>With service providers and contractors that help us operate the Site and deliver services, such as hosting providers, analytics tools, email platforms, and scheduling services</li>
            <li>With independent third-party professionals, including but not limited to real estate agents, lenders, attorneys, tax and accounting professionals, and insurance providers, when you request an introduction, consent to such sharing, or when sharing is reasonably necessary to support the services you have engaged Tomi to provide</li>
            <li>With professional partners in connection with referral or origination arrangements, where permitted by law</li>
            <li>When required to comply with legal obligations, enforce our rights, or protect the safety of users or others</li>
          </ul>
          <p className="mt-3">
            Any third-party professionals introduced through Tomi are independent parties and are not agents, employees, or representatives of Tomi. Their services, advice, and use of your information are governed by their own policies, professional obligations, and agreements.
          </p>
          <p className="mt-3">
            Tomi is not responsible for the privacy practices, services, or advice provided by third-party professionals after an introduction has been made.
          </p>
          <p className="mt-3">
            In some cases, Tomi may receive a referral fee, origination fee, or other form of compensation in connection with introductions to third-party service providers. Any such arrangements do not constitute an endorsement, guarantee, or warranty of third-party services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Cookies and Analytics</h2>
          <p className="mb-3">We use cookies and similar technologies to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Enable core site functionality</li>
            <li>Understand how users interact with the Site</li>
            <li>Improve performance, usability, and content</li>
          </ul>
          <p className="mt-3">
            You may configure your browser to refuse cookies or alert you when cookies are sent. Some Site features may not function properly without cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Data Security</h2>
          <p>
            We implement commercially reasonable administrative, technical, and organizational safeguards designed to protect personal information from unauthorized access, disclosure, alteration, or misuse.
          </p>
          <p className="mt-3">
            No system can be guaranteed to be completely secure, and we cannot guarantee absolute security of information.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Data Retention</h2>
          <p>
            We retain personal information only for as long as reasonably necessary to fulfill the purposes described in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Your Rights and Choices</h2>
          <p className="mb-3">Depending on your location and applicable law, you may have the right to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Request access to personal information we hold about you</li>
            <li>Request correction or deletion of your information</li>
            <li>Opt out of non-essential communications</li>
          </ul>
          <p className="mt-3">
            Requests may be submitted by contacting us at{" "}
            <a href="mailto:contact@livetomi.com" className="text-primary underline underline-offset-2 hover:text-primary/80">
              contact@livetomi.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Children&apos;s Privacy</h2>
          <p>
            Tomi does not knowingly collect personal information from children under the age of 13. If we become aware that such information has been collected, we will take reasonable steps to delete it.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be reflected by an updated effective date. Continued use of the Site after changes are posted constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Contact Information</h2>
          <p>If you have questions about this Privacy Policy or our data practices, please contact us at:</p>
          <address className="mt-3 not-italic">
            Tomi Homes, Inc.<br />
            3208 Irving Ave S<br />
            Minneapolis, MN 55408<br />
            <a href="mailto:contact@livetomi.com" className="text-primary underline underline-offset-2 hover:text-primary/80">
              contact@livetomi.com
            </a>
          </address>
        </section>
      </div>
    </div>
  )
}
