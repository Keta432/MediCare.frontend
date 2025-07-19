import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from 'react-hot-toast';
import ServiceLayout from "../../components/layouts/ServiceLayout";
import { FaCreditCard, FaChartLine, FaFileInvoiceDollar, FaReceipt, FaWallet, FaChartPie, FaBell, FaUserClock, FaCalculator, FaCloudDownloadAlt } from "react-icons/fa";

interface Bill {
  id: string;
  date: string;
  service: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
}

const BillingServicePage = () => {
  const [bills, setBills] = useState<Bill[]>([
    {
      id: "1",
      date: "2024-02-15",
      service: "General Consultation",
      amount: 150.00,
      status: "paid",
      dueDate: "2024-02-28"
    },
    {
      id: "2",
      date: "2024-02-20",
      service: "Laboratory Tests",
      amount: 300.00,
      status: "pending",
      dueDate: "2024-03-05"
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleMakePayment = async () => {
    try {
      const pendingBills = bills.filter(bill => bill.status === "pending");
      if (pendingBills.length === 0) {
        toast.success('No pending bills to pay.');
        return;
      }

      // TODO: Implement actual payment gateway integration
      // For now, just show a success message
      toast.success('Payment initiated. You will be redirected to the payment gateway.');
      
      // Simulate payment success
      setTimeout(() => {
        const updatedBills = bills.map(bill => 
          bill.status === "pending" ? { ...bill, status: "paid" } : bill
        );
        setBills(updatedBills);
        toast.success('Payment completed successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }
  };

  const features = [
    {
      icon: <FaFileInvoiceDollar className="text-purple-600 w-8 h-8 mb-4" />,
      title: "Automated Billing",
      description: "Streamline your billing process with automated invoice generation, reducing manual errors and saving valuable time."
    },
    {
      icon: <FaCreditCard className="text-purple-600 w-8 h-8 mb-4" />,
      title: "Secure Payments",
      description: "Accept multiple payment methods with our PCI-compliant payment processing system, ensuring data security and privacy."
    },
    {
      icon: <FaChartLine className="text-purple-600 w-8 h-8 mb-4" />,
      title: "Financial Analytics",
      description: "Gain valuable insights with comprehensive financial reports and visualizations to optimize your revenue cycle."
    },
    {
      icon: <FaReceipt className="text-purple-600 w-8 h-8 mb-4" />,
      title: "Insurance Management",
      description: "Simplify insurance claim submissions and track reimbursements with our integrated insurance management system."
    }
  ];

  const testimonials = [
    {
      quote: "The automated billing system has reduced our administrative workload by 40% and improved our collection rate significantly.",
      author: "Dr. Sarah Johnson",
      position: "Medical Director, City Health Center"
    },
    {
      quote: "Patient satisfaction has increased since implementing the patient portal with transparent billing. Our patients appreciate the clarity.",
      author: "Michael Chen",
      position: "Practice Manager, Family Medical Group"
    },
    {
      quote: "The insurance verification feature alone has saved us countless hours and reduced claim rejections by nearly 60%.",
      author: "Lisa Rodriguez",
      position: "Billing Supervisor, Memorial Hospital"
    }
  ];

  return (
    <ServiceLayout
      title="Healthcare Billing Solutions"
      description="Streamline financial operations with our comprehensive billing and revenue cycle management system designed specifically for healthcare providers."
      image="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    >
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Powerful Billing Features</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Comprehensive Billing Cycle</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-3 text-center max-w-3xl mx-auto mb-10">
            <p className="text-gray-600">
              Our end-to-end solution covers every step of the revenue cycle, from patient registration to payment collection and reporting.
            </p>
          </div>
          
          {[
            { 
              icon: <FaUserClock className="w-6 h-6" />, 
              title: "Pre-Service", 
              description: "Patient registration, insurance verification, and eligibility checks",
              color: "from-purple-500 to-indigo-500"
            },
            { 
              icon: <FaCalculator className="w-6 h-6" />, 
              title: "During Service", 
              description: "Charge capture, coding, and documentation management",
              color: "from-indigo-500 to-blue-500"
            },
            { 
              icon: <FaWallet className="w-6 h-6" />, 
              title: "Post-Service", 
              description: "Claim submission, payment processing, and collections",
              color: "from-blue-500 to-purple-500"
            }
          ].map((phase, index) => (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${phase.color} p-4 flex items-center justify-center`}>
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white">
                  {phase.icon}
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">{phase.title}</h3>
                <p className="text-gray-600">{phase.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Billing Dashboard</h2>
        
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Billing Dashboard" 
            className="w-full h-96 object-cover object-bottom"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: <FaChartPie />, title: "Financial Overview", description: "Track key financial metrics at a glance" },
            { icon: <FaBell />, title: "Alerts & Reminders", description: "Get notified about pending claims and payments" },
            { icon: <FaCloudDownloadAlt />, title: "Report Generation", description: "Create and export custom financial reports" },
            { icon: <FaChartLine />, title: "Trend Analysis", description: "Visualize financial patterns over time" }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-md border border-purple-100"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">What Our Clients Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-purple-100"
            >
              <svg className="w-10 h-10 text-purple-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.position}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-10 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Ready to streamline your billing operations?</h3>
        <p className="text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
          Our healthcare billing solution can reduce administrative costs, increase revenue, and improve patient satisfaction.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-medium bg-white text-purple-600 hover:bg-purple-50 transition-colors shadow-md">
            Schedule a Demo
          </button>
          <button className="px-8 py-4 rounded-lg font-medium bg-purple-700 text-white hover:bg-purple-800 transition-colors shadow-md">
            Get Started
          </button>
        </div>
      </motion.div>
    </ServiceLayout>
  );
};

export default BillingServicePage; 