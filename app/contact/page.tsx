'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Mail, Phone, MapPin, Clock, Send, 
  MessageCircle, HelpCircle, Heart, Star, CheckCircle,
  Mail as MailIcon, Phone as PhoneIcon, MapPin as MapPinIcon,
  Clock as ClockIcon, MessageSquare, Users, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: <MessageCircle className="w-4 h-4" /> },
    { value: 'support', label: 'Technical Support', icon: <HelpCircle className="w-4 h-4" /> },
    { value: 'feedback', label: 'Feedback', icon: <Heart className="w-4 h-4" /> },
    { value: 'partnership', label: 'Partnership', icon: <Users className="w-4 h-4" /> },
    { value: 'privacy', label: 'Privacy & Safety', icon: <Shield className="w-4 h-4" /> }
  ]

  const contactMethods = [
    {
      icon: <MailIcon className="w-6 h-6" />,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@kids-english.app",
      action: "Send Email",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Chat with us in real-time",
      contact: "Available 9 AM - 6 PM EST",
      action: "Start Chat",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    }
  ]

  const faqItems = [
    {
      question: "How do I reset my child's progress?",
      answer: "You can reset progress from the Parent Dashboard. Go to Settings > Reset Progress to start fresh."
    },
    {
      question: "Is the app safe for children?",
      answer: "Absolutely! We have strict privacy controls, content filtering, and parental monitoring tools to ensure a safe learning environment."
    },
    {
      question: "Can I use the app offline?",
      answer: "Currently, the app requires an internet connection. However, offline mode is coming soon in our next update!"
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can manage your subscription from the Parent Dashboard > Account Settings > Subscription Management."
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Open mail client with pre-filled content
    const mailtoLink = `mailto:support@kids-english.app?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nInquiry Type: ${formData.inquiryType}\n\nMessage:\n${formData.message}`
    )}`
    
    window.location.href = mailtoLink
    setSent(true)
    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/images/kids-learning-background.jpg')] bg-cover bg-center opacity-20" />
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-8 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              We're here to help! Get in touch with our friendly support team for any questions, 
              feedback, or assistance you need.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">Choose your preferred way to reach us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="h-full bg-white/70 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center text-white shadow-lg mx-auto mb-6`}>
                      {method.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{method.title}</h3>
                    <p className="text-gray-600 mb-4">{method.description}</p>
                    <p className="text-sm font-semibold text-gray-700 mb-6">{method.contact}</p>
                    <Button
                      className={`w-full bg-gradient-to-r ${method.color} hover:opacity-90 text-white shadow-lg`}
                        onClick={() => {
                          if (method.title === "Email Support") {
                            window.location.href = "mailto:support@kids-english.app"
                          } else {
                            // Live chat would open a chat widget
                            alert("Live chat feature coming soon!")
                          }
                        }}
                    >
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-xl">
              <CardHeader>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Send us a Message</h3>
                <p className="text-gray-600">We'll get back to you within 24 hours</p>
              </CardHeader>
              <CardContent>
                {!sent ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all duration-200"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Inquiry Type</label>
                      <select
                        value={formData.inquiryType}
                        onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all duration-200"
                      >
                        {inquiryTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all duration-200"
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                        rows={6}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all duration-200 resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          Send Message
                        </div>
                      )}
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Message Sent!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out! We've opened your email client with your message pre-filled. 
                      We'll get back to you within 24 hours.
                    </p>
                    <Button
                      onClick={() => setSent(false)}
                      variant="outline"
                      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-xl">
              <CardHeader>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h3>
                <p className="text-gray-600">Quick answers to common questions</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
                    >
                      <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Our Support Team</h2>
                <p className="text-xl text-white/90">Dedicated to helping your child succeed</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <ClockIcon className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Response Time</h3>
                  <p className="text-white/90">Within 24 hours</p>
                </div>
                <div className="text-center">
                  <Star className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Customer Rating</h3>
                  <p className="text-white/90">4.9/5 stars</p>
                </div>
                <div className="text-center">
                  <Users className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Happy Families</h3>
                  <p className="text-white/90">10,000+ users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}