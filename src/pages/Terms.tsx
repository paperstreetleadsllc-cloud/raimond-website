export default function Terms() {
  return (
    <section className="pt-28 pb-20">
      <div className="section prose prose-invert max-w-3xl">
        <h1>Terms of Use</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          By accessing RAimond, you agree to these Terms. The service is provided “as is” without
          warranties. Nothing herein constitutes financial advice. You are responsible for your
          trading decisions and compliance with laws and broker/platform rules.
        </p>
        <h2>Accounts & Access</h2>
        <p>You must provide accurate information and keep credentials secure.</p>
        <h2>Acceptable Use</h2>
        <p>No unlawful, abusive, or infringing activity. No reverse engineering or unauthorized scraping.</p>
        <h2>Intellectual Property</h2>
        <p>RAimond, RAi, and site content are owned by us or our licensors.</p>
        <h2>Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, we’re not liable for loss of profits or data.</p>
        <h2>Changes</h2>
        <p>We may update these Terms; continued use means acceptance.</p>
        <h2>Contact</h2>
        <p>support@raimondai.com</p>
      </div>
    </section>
  );
}

