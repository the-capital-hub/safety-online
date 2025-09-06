export const metadata = {
  title: "Pricing Policy | Safety Online",
  description: "Learn how Safety Online sets and updates product prices on our platform."
};

export default function PricingPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">Pricing Policy</h1>
      <div className="space-y-2">
        <p>
          <strong>Currency &amp; Taxes:</strong> All prices are in INR and
          exclusive of taxes. Applicable GST and shipping/handling are added at
          checkout and shown on your invoice.
        </p>
        <p>
          <strong>Shipping Charges:</strong> Calculated at checkout based on
          weight/volumetric weight, destination PIN code, and mode.
        </p>
        <p>
          <strong>Offers &amp; Coupons:</strong> Valid only for the stated
          period, non-transferable, and cannot be clubbed unless explicitly
          mentioned.
        </p>
        {/* <p>
          <strong>Bulk/Contract Pricing:</strong> Volume quotes available on
          request; quotes are typically valid for [7/15/30] days and subject to
          stock/MOQs.
        </p> */}
        <p>
          <strong>Price Changes:</strong> Prices may change without prior
          notice. Revisions do not apply to already confirmed orders.
        </p>
        <p>
          <strong>Listing/Typo Errors:</strong> In case of obvious pricing or
          system errors, we may cancel the order and refund in full to the
          original payment method.
        </p>
        <p>
          <strong>Payment Terms:</strong> Prepaid via Razorpay (UPI/Cards/Net-Banking).
          Credit terms apply only to approved B2B accounts.
        </p>
        {/* <p>
          <strong>GST Invoices:</strong> Issued post-dispatch. Please ensure
          billing details/GSTIN are correct; invoices cannot be modified after
          generation.
        </p> */}
        <p>
          <strong>Price Match:</strong> We do not match third-party prices or
          past promotions.
        </p>
      </div>
      <p>
        Questions?{" "}
        <a
          href="mailto:hello@safetyonline.in"
          className="text-blue-600 underline"
        >
         hello@safetyonline.in
        </a>{" "}
        | Mon–Sat 10:00–18:00 IST.
      </p>
    </main>
  );
}
