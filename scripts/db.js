// Dynamic dataset generator for mock data
// Use `node scripts/generate-db.js` to write a static db.json

function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strToSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) h ^= String(str).charCodeAt(i), (h *= 16777619);
  return h >>> 0;
}

function createRng(seed) {
  return mulberry32(typeof seed === 'number' ? seed : strToSeed(seed || 'demo-seed'));
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function int(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
function sampleMany(rng, arr, n) {
  const copy = arr.slice();
  const out = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  return out;
}

const words = [
  'Lorem','Ipsum','Dolor','Sit','Amet','Consectetur','Adipiscing','Elit','Sed','Do','Eiusmod','Tempor','Incididunt','Ut','Labore','Magna','Aliqua','Enim','Minim','Veniam'
];
const cities = ['Metropolis','Gotham','Star City','Central City','Smallville','Harbor City'];
const states = ['State','Region','Province'];

const COUNTS = {
  users: 4,
  organizations: 6,
  contacts: 6,
  leads: 6,
  deals: 5,
  tickets: 4,
  products: 5,
  services: 4,
  vendors: 4,
  pricebooks: 3,
  quotes: 4,
  salesorders: 4,
  purchaseorders: 3,
  invoices: 4,
  campaigns: 3,
  activities: 5,
  documents: 3
};

function money2(n) { return Math.round(n * 100) / 100; }

function address(rng) {
  return {
    street: `${int(rng, 1, 999)} ${pick(rng, words)} St`,
    city: pick(rng, cities),
    state: pick(rng, states),
    postalcode: `${int(rng, 10000, 99999)}`,
    country: 'N/A'
  };
}

function nowIso() { return new Date().toISOString(); }

function build() {
  const seed = process.env.SEED || 'demo-seed';
  const rng = createRng(seed);
  const createdAt = nowIso();

  // Users
  const users = Array.from({ length: COUNTS.users }).map((_, i) => {
    const f = pick(rng, words);
    const l = pick(rng, words);
    return {
      id: i + 1,
      username: (f + l).toLowerCase(),
      first_name: f,
      last_name: l,
      email: `${f}.${l}@example.com`.toLowerCase(),
      role: pick(rng, ['Administrator', 'Sales Manager', 'Account Executive', 'Support']),
      is_active: true
    };
  });

  // Organizations
  const organizations = Array.from({ length: COUNTS.organizations }).map((_, idx) => {
    const id = 1001 + idx;
    const n1 = pick(rng, words), n2 = pick(rng, words);
    return {
      id,
      accountname: `${n1} ${n2}`,
      website: `https://example.com/org-${id}`,
      phone: `+1-000-000-${String(id).slice(-4)}`,
      industry: 'General',
      rating: pick(rng, ['Hot', 'Warm', 'Cold']),
      ownership: pick(rng, ['Private','Public','Cooperative']),
      assigned_user_id: pick(rng, users).id,
      billing_address: address(rng),
      shipping_address: address(rng),
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  // Contacts
  const contacts = Array.from({ length: COUNTS.contacts }).map((_, idx) => {
    const id = 2001 + idx;
    const f = pick(rng, words), l = pick(rng, words);
    const org = pick(rng, organizations);
    return {
      id,
      firstname: f,
      lastname: l,
      email: `${f}.${l}@example.com`.toLowerCase(),
      phone: `+1-000-000-${String(id).slice(-4)}`,
      title: pick(rng, ['Operations Manager','Procurement Coordinator','Sustainability Specialist','Site Supervisor','Store Manager','Field Coordinator']),
      account_id: org.id,
      assigned_user_id: pick(rng, users).id,
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  // Leads
  const leads = Array.from({ length: COUNTS.leads }).map((_, idx) => {
    const id = 3001 + idx;
    const f = pick(rng, words), l = pick(rng, words);
    return {
      id,
      firstname: f,
      lastname: l,
      company: `${pick(rng, words)} ${pick(rng, words)} Co` ,
      email: `${f}.${l}@example.com`.toLowerCase(),
      phone: `+1-000-000-${String(id).slice(-4)}`,
      leadsource: pick(rng, ['Website','Referral','Event','Campaign']),
      leadstatus: pick(rng, ['New','Contacted','Qualified']),
      industry: 'General',
      annualrevenue: int(rng, 300000, 6000000),
      rating: pick(rng, ['Hot','Warm','Cold']),
      assigned_user_id: pick(rng, users).id,
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  // Deals
  const deals = Array.from({ length: COUNTS.deals }).map((_, idx) => {
    const id = 4001 + idx;
    const org = pick(rng, organizations);
    const cands = contacts.filter(c => c.account_id === org.id);
    const contact = cands.length ? pick(rng, cands) : pick(rng, contacts);
    const lead = rng() < 0.7 ? pick(rng, leads).id : null;
    return {
      id,
      potentialname: `${pick(rng, words)} Opportunity ${int(rng, 2024, 2026)}`,
      amount: money2(int(rng, 2000, 20000)),
      currency: 'USD',
      closingdate: `2025-${String(int(rng,1,12)).padStart(2,'0')}-${String(int(rng,1,28)).padStart(2,'0')}`,
      sales_stage: pick(rng, ['Qualification','Proposal','Negotiation']),
      probability: int(rng, 10, 80),
      account_id: org.id,
      contact_id: contact.id,
      lead_id: lead,
      assigned_user_id: pick(rng, users).id,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  // Vendors
  const vendors = Array.from({ length: COUNTS.vendors }).map((_, idx) => {
    const id = 6201 + idx;
    return {
      id,
      vendorname: `Vendor ${pick(rng, words)}`,
      phone: `+1-000-000-${id}`.slice(0,16),
      email: `vendor.${id}@example.com`,
      website: `https://example.com/vendor-${id}`,
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  // Products
  const productUnits = ['unit','pack','bag','roll','kit'];
  const products = Array.from({ length: COUNTS.products }).map((_, idx) => {
    const id = 6001 + idx;
    const name = `Product ${pick(rng, words)} (${pick(rng, ['Unit','Pack','Bag','Roll','Kit'])})`;
    return {
      id,
      productname: name,
      productcode: `P-${id}`,
      commissionrate: int(rng, 3, 10),
      qtyinstock: int(rng, 50, 1000),
      usageunit: pick(rng, productUnits),
      unit_price: money2(rng() * 90 + 10),
      taxclass: 'Standard Tax',
      vendor_id: pick(rng, vendors).id,
      active: true,
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  // Services
  const services = Array.from({ length: COUNTS.services }).map((_, idx) => {
    const id = 6101 + idx;
    return {
      id,
      servicename: `Service ${pick(rng, words)}`,
      service_no: `SRV-${String(id).slice(-3)}`,
      servicecategory: 'General',
      unit_price: money2(rng() * 400 + 50),
      taxclass: 'Standard Tax',
      commissionrate: int(rng, 5, 15),
      active: true,
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  // Pricebooks
  const pricebooks = Array.from({ length: COUNTS.pricebooks }).map((_, idx) => {
    const id = 6301 + idx;
    return {
      id,
      bookname: `Pricebook ${pick(rng, words)}`,
      currency: 'USD',
      active: rng() < 0.85,
      description: 'Demo pricing',
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  function makeQuoteLike(idBase, kind) {
    const id = idBase;
    const org = pick(rng, organizations);
    const cands = contacts.filter(c => c.account_id === org.id);
    const contact = cands.length ? pick(rng, cands) : pick(rng, contacts);
    const items = [];
    const itemCount = int(rng, 1, 2);
    for (let i = 0; i < itemCount; i++) {
      if (rng() < 0.6) {
        const p = pick(rng, products);
        items.push({ type: 'Product', ref_id: p.id, name: p.productname, qty: int(rng, 1, 100), listprice: p.unit_price, discount: 0 });
      } else {
        const s = pick(rng, services);
        items.push({ type: 'Service', ref_id: s.id, name: s.servicename, qty: int(rng, 1, 5), listprice: s.unit_price, discount: 0 });
      }
    }
    const subtotal = money2(items.reduce((sum, it) => sum + it.qty * it.listprice, 0));
    const tax = money2(subtotal * 0.16);
    const total = money2(subtotal + tax);
    const base = {
      id,
      account_id: org.id,
      contact_id: contact.id,
      line_items: items,
      subtotal, tax, adjustment: 0, total,
      assigned_user_id: pick(rng, users).id,
      created_at: createdAt,
      updated_at: createdAt
    };
    if (kind === 'quote') {
      return Object.assign(base, {
        subject: `Quote ${pick(rng, words)}`,
        quotestage: 'Created',
        validtill: `2025-${String(int(rng,1,12)).padStart(2,'0')}-${String(int(rng,1,28)).padStart(2,'0')}`,
        billing_address: address(rng),
        shipping_address: address(rng)
      });
    }
    if (kind === 'so') {
      return Object.assign(base, {
        subject: `SO-${String(id).slice(-4)}`,
        sostatus: 'Created',
        bill_to: address(rng),
        ship_to: address(rng)
      });
    }
    if (kind === 'invoice') {
      return Object.assign(base, {
        subject: `INV-${String(id).slice(-4)}`,
        invoicestatus: 'Created'
      });
    }
  }

  const quotes = Array.from({ length: COUNTS.quotes }).map((_, idx) => makeQuoteLike(7001 + idx, 'quote'));
  const salesorders = Array.from({ length: COUNTS.salesorders }).map((_, idx) => {
    const so = makeQuoteLike(7101 + idx, 'so');
    // link to a quote if available
    so.quote_id = pick(rng, quotes).id;
    return so;
  });
  const invoices = Array.from({ length: COUNTS.invoices }).map((_, idx) => {
    const inv = makeQuoteLike(7301 + idx, 'invoice');
    inv.salesorder_id = pick(rng, salesorders).id;
    return inv;
  });

  // Purchase Orders
  const purchaseorders = Array.from({ length: COUNTS.purchaseorders }).map((_, idx) => {
    const id = 7201 + idx;
    const v = pick(rng, vendors);
    const itemCount = int(rng, 1, 2);
    const items = sampleMany(rng, products, itemCount).map(p => ({ type: 'Product', ref_id: p.id, name: p.productname, qty: int(rng, 10, 500), costprice: money2(p.unit_price * (0.6 + rng() * 0.2)) }));
    const subtotal = money2(items.reduce((s, it) => s + it.qty * it.costprice, 0));
    const tax = money2(subtotal * 0.16);
    const total = money2(subtotal + tax);
    return {
      id,
      subject: `PO-${String(id).slice(-4)}`,
      postatus: 'Created',
      vendor_id: v.id,
      requisition_no: `REQ-${int(rng,1000,9999)}`,
      due_date: `2025-${String(int(rng,1,12)).padStart(2,'0')}-${String(int(rng,1,28)).padStart(2,'0')}`,
      line_items: items,
      subtotal, tax, adjustment: 0, total,
      assigned_user_id: pick(rng, users).id,
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  // Campaigns
  const campaigns = Array.from({ length: COUNTS.campaigns }).map((_, idx) => {
    const id = 7401 + idx;
    return {
      id,
      campaignname: `${pick(rng, words)} Campaign`,
      campaigntype: pick(rng, ['Email','Social','Webinar']),
      campaignstatus: pick(rng, ['Planning','In Progress','Completed']),
      targetaudience: 'Prospects',
      expectedrevenue: int(rng, 10000, 100000),
      budgetcost: int(rng, 1000, 10000),
      actualcost: int(rng, 0, 5000),
      numsent: int(rng, 0, 5000),
      expectedresponse: int(rng, 5, 20),
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  // Activities
  const activities = Array.from({ length: COUNTS.activities }).map((_, idx) => {
    const id = 8001 + idx;
    const org = pick(rng, organizations);
    const ct = pick(rng, contacts.filter(c => c.account_id === org.id).concat(contacts));
    const dl = pick(rng, deals);
    return {
      id,
      activitytype: pick(rng, ['Meeting','Call','Task','Email']),
      subject: `${pick(rng, words)} ${pick(rng, ['review','follow-up','sync'])}`,
      date_start: `2025-${String(int(rng,1,12)).padStart(2,'0')}-${String(int(rng,1,28)).padStart(2,'0')}`,
      time_start: `${String(int(rng,8,16)).padStart(2,'0')}:${String(int(rng,0,59)).padStart(2,'0')}`,
      due_date: `2025-${String(int(rng,1,12)).padStart(2,'0')}-${String(int(rng,1,28)).padStart(2,'0')}`,
      time_end: `${String(int(rng,8,18)).padStart(2,'0')}:${String(int(rng,0,59)).padStart(2,'0')}`,
      status: pick(rng, ['Planned','Scheduled','In Progress','Completed']),
      location: pick(rng, ['Google Meet','Phone','Office','Customer HQ']),
      account_id: org.id,
      contact_id: ct.id,
      deal_id: dl.id,
      assigned_user_id: pick(rng, users).id,
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  // Documents
  const documents = Array.from({ length: COUNTS.documents }).map((_, idx) => {
    const id = 9001 + idx;
    const relType = pick(rng, ['Accounts','Quotes','Invoices']);
    const relId = relType === 'Accounts' ? pick(rng, organizations).id : relType === 'Quotes' ? pick(rng, quotes).id : pick(rng, invoices).id;
    return {
      id,
      title: `${pick(rng, words)}-${id}.pdf`,
      filetype: 'application/pdf',
      filesize: int(rng, 120000, 420000),
      path: `/files/${id}.pdf`,
      notes: 'Demo document',
      related_to_type: relType,
      related_to_id: relId,
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  return {
    users,
    organizations,
    contacts,
    leads,
    deals,
    tickets: Array.from({ length: COUNTS.tickets }).map((_, idx) => {
      const id = 5001 + idx;
      const org = pick(rng, organizations);
      const ct = pick(rng, contacts.filter(c => c.account_id === org.id).concat(contacts));
      return {
        id,
        ticket_no: `TCK-${String(id).slice(-4)}`,
        ticket_title: `${pick(rng, words)} request`,
        status: pick(rng, ['Open','In Progress','Closed']),
        priority: pick(rng, ['Low','Medium','High']),
        category: 'General',
        hours: Math.round((rng() * 2) * 10) / 10,
        related_to_type: 'Accounts',
        related_to_id: org.id,
        contact_id: ct.id,
        assigned_user_id: pick(rng, users).id,
        created_at: createdAt,
        updated_at: createdAt
      };
    }),
    products,
    services,
    vendors,
    pricebooks,
    quotes,
    salesorders,
    purchaseorders,
    invoices,
    campaigns,
    activities,
    documents
  };
}

module.exports = () => build();
