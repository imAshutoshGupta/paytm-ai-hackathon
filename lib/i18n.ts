export type Language = 'en' | 'hi' | 'mr'
export type BusinessType = 'kirana' | 'tuition' | 'tailor'

const strings: Record<string, Record<Language, string>> = {
  // Nav
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  'nav.dues': { en: 'Dues', hi: 'उधार', mr: 'उधार' },
  'nav.bills': { en: 'Bills', hi: 'बिल', mr: 'बिल' },
  'nav.stock': { en: 'Stock', hi: 'स्टॉक', mr: 'स्टॉक' },
  'nav.ask': { en: 'Ask AI', hi: 'पूछें', mr: 'विचारा' },
  'nav.admin': { en: 'Admin', hi: 'एडमिन', mr: 'ॲडमिन' },
  // Login
  'login.title': { en: 'Welcome to Hisaab', hi: 'हिसाब में आपका स्वागत है', mr: 'हिसाबमध्ये आपले स्वागत आहे' },
  'login.subtitle': { en: 'Your AI-powered business assistant', hi: 'आपका AI बिज़नेस असिस्टेंट', mr: 'तुमचा AI बिझनेस सहाय्यक' },
  'login.phone': { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाइल नंबर' },
  'login.sendOtp': { en: 'Send OTP', hi: 'OTP भेजें', mr: 'OTP पाठवा' },
  'login.enterOtp': { en: 'Enter OTP', hi: 'OTP दर्ज करें', mr: 'OTP टाका' },
  'login.verify': { en: 'Verify', hi: 'सत्यापित करें', mr: 'सत्यापित करा' },
  'login.selectBusiness': { en: 'What kind of business do you run?', hi: 'आप कौन सा व्यवसाय चलाते हैं?', mr: 'तुम्ही कोणता व्यवसाय चालवता?' },
  'login.yourName': { en: 'Your Name', hi: 'आपका नाम', mr: 'तुमचे नाव' },
  'login.businessName': { en: 'Business Name', hi: 'दुकान/व्यवसाय का नाम', mr: 'दुकान/व्यवसायाचे नाव' },
  'login.getStarted': { en: 'Get Started', hi: 'शुरू करें', mr: 'सुरुवात करा' },
  'login.kirana': { en: 'Kirana Store', hi: 'किराना दुकान', mr: 'किराणा दुकान' },
  'login.tuition': { en: 'Tuition Teacher', hi: 'ट्यूशन टीचर', mr: 'शिकवणी शिक्षक' },
  'login.tailor': { en: 'Tailor', hi: 'दर्जी', mr: 'शिंपी' },
  'login.otpSent': { en: 'OTP sent! (use 1234)', hi: 'OTP भेजा गया! (1234 डालें)', mr: 'OTP पाठवला! (1234 टाका)' },
  'login.step1': { en: 'Phone', hi: 'फोन', mr: 'फोन' },
  'login.step2': { en: 'Verify', hi: 'सत्यापित', mr: 'सत्यापित' },
  'login.step3': { en: 'Profile', hi: 'प्रोफाइल', mr: 'प्रोफाइल' },
  // Dashboard
  'dash.greeting.morning': { en: 'Good morning', hi: 'शुभ प्रभात', mr: 'शुभ प्रभात' },
  'dash.greeting.afternoon': { en: 'Good afternoon', hi: 'नमस्ते', mr: 'नमस्कार' },
  'dash.greeting.evening': { en: 'Good evening', hi: 'शुभ संध्या', mr: 'शुभ संध्या' },
  'dash.todayIncome': { en: "Today's Income", hi: 'आज की कमाई', mr: 'आजचे उत्पन्न' },
  'dash.totalDues': { en: 'Total Dues', hi: 'कुल उधार', mr: 'एकूण उधार' },
  'dash.pendingBills': { en: 'Pending Bills', hi: 'बाकी बिल', mr: 'बाकी बिल' },
  'dash.lowStock': { en: 'Low Stock Items', hi: 'कम स्टॉक', mr: 'कमी स्टॉक' },
  'dash.recentActivity': { en: 'Recent Activity', hi: 'हालिया गतिविधि', mr: 'अलीकडील हालचाल' },
  'dash.addDue': { en: '+ Add Due', hi: '+ उधार जोड़ें', mr: '+ उधार जोडा' },
  'dash.logSale': { en: '+ Log Sale', hi: '+ बिक्री दर्ज', mr: '+ विक्री नोंद' },
  'dash.scanBill': { en: 'Scan Bill', hi: 'बिल स्कैन', mr: 'बिल स्कॅन' },
  'dash.askHisaab': { en: 'Ask Hisaab', hi: 'हिसाब से पूछें', mr: 'हिसाबला विचारा' },
  'dash.aiMorningBrief': { en: "Today's AI Briefing", hi: 'आज की AI रिपोर्ट', mr: 'आजचा AI अहवाल' },
  'dash.noActivity': { en: 'No recent activity', hi: 'कोई हालिया गतिविधि नहीं', mr: 'अलीकडील हालचाल नाही' },
  // Udhaar
  'udhaar.title': { en: 'Dues Manager', hi: 'उधार मैनेजर', mr: 'उधार व्यवस्थापक' },
  'udhaar.title.tuition': { en: 'Fee Dues', hi: 'फीस बाकी', mr: 'फी थकबाकी' },
  'udhaar.title.tailor': { en: 'Customer Advances', hi: 'ग्राहक अग्रिम', mr: 'ग्राहक आगाऊ' },
  'udhaar.addNew': { en: 'Add Due', hi: 'उधार जोड़ें', mr: 'उधार जोडा' },
  'udhaar.customerName': { en: 'Customer Name', hi: 'ग्राहक का नाम', mr: 'ग्राहकाचे नाव' },
  'udhaar.customerName.tuition': { en: 'Student Name', hi: 'छात्र का नाम', mr: 'विद्यार्थ्याचे नाव' },
  'udhaar.customerName.tailor': { en: 'Customer Name', hi: 'ग्राहक का नाम', mr: 'ग्राहकाचे नाव' },
  'udhaar.amount': { en: 'Amount (₹)', hi: 'राशि (₹)', mr: 'रक्कम (₹)' },
  'udhaar.note': { en: 'Note', hi: 'नोट', mr: 'नोंद' },
  'udhaar.status.pending': { en: 'Pending', hi: 'बाकी', mr: 'बाकी' },
  'udhaar.status.partial': { en: 'Partial', hi: 'आंशिक', mr: 'आंशिक' },
  'udhaar.status.paid': { en: 'Paid', hi: 'चुकाया', mr: 'भरले' },
  'udhaar.markPaid': { en: 'Mark Paid', hi: 'भुगतान हुआ', mr: 'भरले म्हणा' },
  'udhaar.sendReminder': { en: 'Reminder', hi: 'याद दिलाएं', mr: 'आठवण' },
  'udhaar.daysOverdue': { en: 'days overdue', hi: 'दिन बाकी', mr: 'दिवस थकीत' },
  'udhaar.voiceHint': { en: 'Say: "Ramesh owes ₹500"', hi: 'बोलें: "रमेश का 500 रुपये उधार"', mr: 'बोला: "रमेश चे ५०० रुपये उधार"' },
  'udhaar.search': { en: 'Search by name...', hi: 'नाम से खोजें...', mr: 'नावाने शोधा...' },
  'udhaar.totalDue': { en: 'Total Due', hi: 'कुल बाकी', mr: 'एकूण बाकी' },
  'udhaar.partialPay': { en: 'Record Partial Payment', hi: 'आंशिक भुगतान दर्ज करें', mr: 'आंशिक भरणा नोंदवा' },
  // Bills
  'bills.title': { en: 'Bill Scanner', hi: 'बिल स्कैनर', mr: 'बिल स्कॅनर' },
  'bills.upload': { en: 'Upload Bill Photo', hi: 'बिल फोटो अपलोड करें', mr: 'बिल फोटो अपलोड करा' },
  'bills.vendor': { en: 'Vendor', hi: 'विक्रेता', mr: 'विक्रेता' },
  'bills.totalAmount': { en: 'Total Amount', hi: 'कुल राशि', mr: 'एकूण रक्कम' },
  'bills.status.paid': { en: 'Paid', hi: 'भुगतान किया', mr: 'भरले' },
  'bills.status.unpaid': { en: 'Unpaid', hi: 'बाकी', mr: 'बाकी' },
  'bills.askQuery': { en: 'Ask about your bills...', hi: 'बिल के बारे में पूछें...', mr: 'बिलबद्दल विचारा...' },
  'bills.scanning': { en: 'Scanning bill...', hi: 'बिल स्कैन हो रहा है...', mr: 'बिल स्कॅन होत आहे...' },
  'bills.dropHere': { en: 'Drop bill image here or click to upload', hi: 'यहाँ बिल की फोटो डालें या क्लिक करें', mr: 'येथे बिलाचा फोटो टाका किंवा क्लिक करा' },
  'bills.markPaid': { en: 'Mark Paid', hi: 'भुगतान हुआ', mr: 'भरले म्हणा' },
  // Inventory
  'inv.title': { en: 'Stock Tracker', hi: 'स्टॉक ट्रैकर', mr: 'स्टॉक ट्रॅकर' },
  'inv.title.tuition': { en: 'Materials', hi: 'सामग्री', mr: 'साहित्य' },
  'inv.title.tailor': { en: 'Fabric & Supplies', hi: 'कपड़ा और सामान', mr: 'कापड आणि साहित्य' },
  'inv.addItem': { en: 'Add Item', hi: 'आइटम जोड़ें', mr: 'वस्तू जोडा' },
  'inv.itemName': { en: 'Item Name', hi: 'वस्तु का नाम', mr: 'वस्तूचे नाव' },
  'inv.quantity': { en: 'Quantity', hi: 'मात्रा', mr: 'प्रमाण' },
  'inv.unit': { en: 'Unit', hi: 'इकाई', mr: 'एकक' },
  'inv.threshold': { en: 'Reorder At', hi: 'पुनर्ऑर्डर', mr: 'पुनर्ऑर्डर' },
  'inv.lowStock': { en: 'Low Stock', hi: 'कम स्टॉक', mr: 'कमी स्टॉक' },
  'inv.inStock': { en: 'In Stock', hi: 'स्टॉक में', mr: 'स्टॉकमध्ये' },
  'inv.updateQty': { en: 'Update Qty', hi: 'मात्रा अपडेट', mr: 'प्रमाण अपडेट' },
  'inv.aiSuggestion': { en: 'AI Stock Insight', hi: 'AI स्टॉक सुझाव', mr: 'AI स्टॉक सूचना' },
  // Ask
  'ask.title': { en: 'Ask Hisaab', hi: 'हिसाब से पूछें', mr: 'हिसाबला विचारा' },
  'ask.placeholder': { en: 'Ask anything about your business...', hi: 'अपने व्यवसाय के बारे में कुछ भी पूछें...', mr: 'तुमच्या व्यवसायाबद्दल काहीही विचारा...' },
  'ask.thinking': { en: 'Hisaab is thinking...', hi: 'हिसाब सोच रहा है...', mr: 'हिसाब विचार करत आहे...' },
  'ask.examples': { en: 'Try asking:', hi: 'यह पूछकर देखें:', mr: 'हे विचारून पहा:' },
  'ask.example1': { en: 'Who owes me the most money?', hi: 'सबसे ज्यादा उधार किसका है?', mr: 'सर्वाधिक उधार कोणाचे आहे?' },
  'ask.example2': { en: 'What did I earn this week?', hi: 'इस हफ्ते कितना कमाया?', mr: 'या आठवड्यात किती कमावले?' },
  'ask.example3': { en: 'Which items are running low?', hi: 'कौन से आइटम कम हैं?', mr: 'कोणत्या वस्तू कमी आहेत?' },
  'ask.example4': { en: 'How much do I owe suppliers?', hi: 'सप्लायर को कितना देना है?', mr: 'पुरवठादाराला किती द्यायचे आहे?' },
  // Common
  'common.save': { en: 'Save', hi: 'सहेजें', mr: 'जतन करा' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें', mr: 'रद्द करा' },
  'common.delete': { en: 'Delete', hi: 'हटाएं', mr: 'हटवा' },
  'common.edit': { en: 'Edit', hi: 'संपादित', mr: 'संपादित' },
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...' },
  'common.error': { en: 'Something went wrong', hi: 'कुछ गलत हुआ', mr: 'काहीतरी चूक झाली' },
  'common.noData': { en: 'No data yet', hi: 'अभी कोई डेटा नहीं', mr: 'अद्याप डेटा नाही' },
  'common.rupees': { en: '₹', hi: '₹', mr: '₹' },
  'common.search': { en: 'Search', hi: 'खोजें', mr: 'शोधा' },
  'common.all': { en: 'All', hi: 'सभी', mr: 'सर्व' },
  'common.today': { en: 'Today', hi: 'आज', mr: 'आज' },
  'common.send': { en: 'Send', hi: 'भेजें', mr: 'पाठवा' },
  'common.logout': { en: 'Logout', hi: 'लॉगआउट', mr: 'लॉगआउट' },
  'common.items': { en: 'items', hi: 'आइटम', mr: 'वस्तू' },
  'common.copied': { en: 'Copied!', hi: 'कॉपी हो गया!', mr: 'कॉपी झाले!' },
  // Admin
  'admin.title': { en: 'Admin Panel', hi: 'एडमिन पैनल', mr: 'ॲडमिन पॅनेल' },
  'admin.merchants': { en: 'Merchant Overview', hi: 'व्यापारी अवलोकन', mr: 'व्यापारी आढावा' },
  'admin.demoControl': { en: 'Demo Control', hi: 'डेमो कंट्रोल', mr: 'डेमो नियंत्रण' },
  'admin.seedData': { en: 'Seed Mock Data', hi: 'डेमो डेटा लोड करें', mr: 'डेमो डेटा लोड करा' },
  'admin.clearData': { en: 'Clear All Data', hi: 'सभी डेटा हटाएं', mr: 'सर्व डेटा हटवा' },
  'admin.apiHealth': { en: 'API Health', hi: 'API स्वास्थ्य', mr: 'API आरोग्य' },
}

export function t(key: string, language: Language = 'en'): string {
  return strings[key]?.[language] ?? strings[key]?.['en'] ?? key
}

export function getBusinessLabel(
  key: string,
  businessType: BusinessType,
  language: Language = 'en',
): string {
  const specificKey = `${key}.${businessType}`
  if (strings[specificKey]) return t(specificKey, language)
  return t(key, language)
}

export function formatAmount(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
  if (amount >= 1000) {
    const str = Math.round(amount).toString()
    if (str.length > 3) return `₹${str.slice(0, str.length - 3)},${str.slice(-3)}`
  }
  return `₹${Math.round(amount)}`
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
