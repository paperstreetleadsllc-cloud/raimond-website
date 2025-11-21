export default function Privacy() {
  return (
    <section className="pt-28 pb-20">
      <div className="section prose prose-invert max-w-3xl">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          RAimond (“we”, “us”) respects your privacy. This policy describes the information we collect,
          how we use it, and your choices. We collect basic contact details you provide (e.g., name,
          email) when you request beta access or contact support. We use this to communicate with you,
          administer beta access, and improve our products.
        </p>
        <h2>Information We Collect</h2>
        <ul>
          <li>Contact info you submit (name, email, notes)</li>
          <li>Technical data from site usage (IP, device, pages viewed)</li>
        </ul>
        <h2>Use of Information</h2>
        <ul>
          <li>To provide updates, onboarding, and product information</li>
          <li>To analyze aggregate usage and improve RAimond</li>
        </ul>
        <h2>Data Sharing</h2>
        <p>We don’t sell your data. We may use trusted processors (e.g., email providers) under DPA terms.</p>
        <h2>Security</h2>
        <p>We use reasonable administrative, technical, and physical safeguards.</p>
        <h2>Your Rights</h2>
        <p>Contact <a href="mailto:support@raimondai.com">support@raimondai.com</a> to access, correct, or delete your data.</p>
        <h2>Contact</h2>
        <p>RAimond AI — support@raimondai.com</p>
      </div>
    </section>
  );
}

