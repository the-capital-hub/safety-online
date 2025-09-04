export const metadata = {
  title: "Shipping Policy | Safety Online",
  description: "Information on shipping methods, timelines, and charges for orders placed on Safety Online.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Shipping Policy</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Jump to</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <a href="#free-delivery" className="text-blue-600 hover:underline">
              Do you offer Free Delivery?
            </a>
          </li>
          <li>
            <a href="#heavy-bulky" className="text-blue-600 hover:underline">
              Heavy/Bulky Items
            </a>
          </li>
          <li>
            <a href="#order-pick-up" className="text-blue-600 hover:underline">
              Order Pick Up–
            </a>
          </li>
          <li>
            <a
              href="#standard-cost"
              className="text-blue-600 hover:underline"
            >
              Standard Cost of Delivery
            </a>
          </li>
          <li>
            <a href="#shipping-options" className="text-blue-600 hover:underline">
              Shipping Options
            </a>
          </li>
          <li>
            <a href="#delivery-returns" className="text-blue-600 hover:underline">
              Delivery Returns
            </a>
          </li>
        </ul>
      </section>

      <section id="free-delivery" className="space-y-2">
        <h2 className="text-xl font-semibold">Do you offer Free Delivery?</h2>
        <p>
          Ladwa Solutions Inc , India offers standard Free Delivery for online
          orders via Transport ( provided available at the pin code ) for
          Rs.50,000+ (exclusive of GST)* for Standard Products (SP)
        </p>
        <p>
          If your order online contains Heavy/Bulky (HB)Items or Bulk quantities
          additional delivery/freight charge applies upon completion. Some
          regional/geographically remote locations may incur additional freight
          charges.
        </p>
        <p>Terms &amp; Conditions apply. | Heavy/Bulky Items List</p>
      </section>

      <section id="heavy-bulky" className="space-y-2">
        <h2 className="text-xl font-semibold">Heavy/Bulky Items</h2>
        <p>
          Freight charges may apply for heavy and/or bulky (HB) items. Some bulk
          quantity purchases are excluded from free delivery.
        </p>
        <p>
          Items that are classified as Heavy/Bulky (HB) may have extra freight
          charges apply. If your order online contains Heavy/Bulky Items or Bulk
          quantities additional delivery/freight charge applies upon completion
          (customer service representative will contact you). Call 9945234161 for
          any enquiries.
        </p>
        <p>
          <strong>Note:</strong> Some regional &amp; geographically remote
          locations may incur additional charges once order is booked with the
          courier. We will advise if required to obtain acceptance and approval
          to proceed.
        </p>
        <p>
          Any promotions that offer free delivery or delivery discounts do not
          apply to heavy or bulky items. If you are unsure, please call Seton for
          confirmation.
        </p>
        <p>Terms &amp; Conditions apply. | Heavy/Bulky Items List</p>
      </section>

      <section id="order-pick-up" className="space-y-2">
        <h2 className="text-xl font-semibold">Order Pick Up–</h2>
        <p>Booking required:</p>
        <p>Call 9945234161 to book a time for pickup.</p>
        <p>Pick up booking times availability: Monday–Saturday , 9am – 5:30pm</p>
        <p>Address:</p>
        <p>
          Ladwa Solutions Inc
          <br />
          37/1, 6th Main,
          <br />
          Singasandra Industrial estate
          <br />
          Bangalore – 560102
        </p>
      </section>

      <section id="standard-cost" className="space-y-2">
        <h2 className="text-xl font-semibold">Standard Cost of Delivery</h2>
        <p>
          Standard shipping cost for each order value price bracket. When
          delivery charges apply: shipping and handling is based on order value.
          Prices quoted are exclusive of GST.
        </p>
        <p>
          Please note this is for standard products ( SP) only. Items that are
          classified as Heavy/Bulky(HB) may have extra freight charges apply.
          Heavy/Bulky Items List. We only ship orders to destinations within
          India
        </p>
        <p>
          <strong>Note:</strong> Some regional &amp; geographically remote
          locations may incur additional charges once order is booked with the
          courier. We will advise if required to obtain acceptance and approval
          to proceed.
        </p>
      </section>

      <section id="shipping-options" className="space-y-2">
        <h2 className="text-xl font-semibold">Shipping Options</h2>
        <p>
          Products under 5kg in weight are sent via Delhivery courier these goods
          will arrive the second business day to most metro locations in South
          India and 4-5 business days in the central , west India, and 5-7 days
          for North and east India.
        </p>
        <p>
          For in stock items, orders received and processed by us before 1pm IST
          each business day will be dispatched the same day.
        </p>
        <p>
          International Orders: We are able to deliver orders outside of India .
          Call our team 9945234161 for details.
        </p>
      </section>

      <section id="delivery-returns" className="space-y-2">
        <h2 className="text-xl font-semibold">Delivery Returns</h2>
        <p>
          In addition to our standard returns policy, where the customer wishes
          to return the product, the refunded amount will match the price paid at
          the time of purchase excluding any additional returns shipping costs.
          Reference on Terms and Conditions
        </p>
        <p>Terms &amp; Conditions</p>
      </section>
    </main>
  );
}
