"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  TrendingDown,
  Eye,
  Upload,
  BarChart3,
  Download
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-prisere-dark-gray">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-prisere-maroon hover:bg-prisere-maroon/90">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-prisere-dark-gray mb-6" 
              style={{ fontFamily: 'var(--font-heading)' }}>
            Stop Getting Surprised by 
            <span className="text-prisere-maroon"> Insurance Changes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload your Small Business insurance policy and renewal quote. Get a clear, factual analysis of what changed 
            in plain English. Know exactly what you&apos;re signing before your renewal deadline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/sign-up">
              <Button size="lg" className="bg-prisere-maroon hover:bg-prisere-maroon/90 text-lg px-8 py-6">
                Analyze My Policy Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => {
              const section = document.querySelector('[id="how-it-works"]') as HTMLElement;
              if (section) {
                const offsetTop = section.offsetTop - 100; // 100px offset for header
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              }
            }}>
              See How It Works
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-prisere-teal" />
              Bank-level security
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-prisere-teal" />
              Results in 2 minutes
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-prisere-teal" />
              100% factual analysis only
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-prisere-dark-gray mb-4" 
                style={{ fontFamily: 'var(--font-heading)' }}>
              Insurance Renewals Shouldn&apos;t Be a Mystery
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every year, business owners receive renewal quotes with dozens of changes buried in legal language. 
              Most people sign without knowing what actually changed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-prisere-maroon">
              <CardContent className="p-6">
                <AlertTriangle className="h-8 w-8 text-prisere-maroon mb-4" />
                <h3 className="font-semibold text-lg mb-2">Hidden Changes</h3>
                <p className="text-gray-600 text-sm">
                  Coverage reductions, new exclusions, and higher deductibles are often buried on page 47 of your renewal documents.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-prisere-teal">
              <CardContent className="p-6">
                <TrendingDown className="h-8 w-8 text-prisere-teal mb-4" />
                <h3 className="font-semibold text-lg mb-2">Paying More for Less</h3>
                <p className="text-gray-600 text-sm">
                  Premium increases are obvious, but coverage decreases are not. You might be paying 10% more for 50% less protection.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-prisere-mustard">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 text-prisere-mustard mb-4" />
                <h3 className="font-semibold text-lg mb-2">Time Pressure</h3>
                <p className="text-gray-600 text-sm">
                  Renewal deadlines don&apos;t wait. By the time you realize something&apos;s wrong, it&apos;s often too late to make changes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-prisere-dark-gray mb-4" 
                style={{ fontFamily: 'var(--font-heading)' }}>
              Get Clear Answers in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600">
              No insurance expertise required. Just upload your documents and get factual comparisons.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Upload className="h-8 w-8 text-prisere-maroon" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Upload Your Documents</h3>
              <p className="text-gray-600 text-sm">
                Upload your current policy and renewal quote. We support PDF files up to 50MB.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BarChart3 className="h-8 w-8 text-prisere-maroon" />
              </div>
              <h3 className="font-semibold text-lg mb-2">2. AI Analysis</h3>
              <p className="text-gray-600 text-sm">
                Our AI compares every section, identifying changes in coverage, deductibles, exclusions, and premiums.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Eye className="h-8 w-8 text-prisere-maroon" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Clear Report</h3>
              <p className="text-gray-600 text-sm">
                Get a plain-English summary of what changed, organized by impact to your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-prisere-dark-gray mb-4" 
                style={{ fontFamily: 'var(--font-heading)' }}>
              Why Small Business Owners Choose Prisere
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-prisere-teal/10 rounded-lg p-4 mb-4">
                <FileText className="h-8 w-8 text-prisere-teal mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">No Legal Jargon</h3>
              <p className="text-gray-600 text-sm">
                Plain English explanations of what each change means for your business.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-prisere-teal/10 rounded-lg p-4 mb-4">
                <Clock className="h-8 w-8 text-prisere-teal mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">Save Hours</h3>
              <p className="text-gray-600 text-sm">
                Get insights in 2 minutes instead of spending hours reading fine print.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-prisere-teal/10 rounded-lg p-4 mb-4">
                <Shield className="h-8 w-8 text-prisere-teal mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">Avoid Surprises</h3>
              <p className="text-gray-600 text-sm">
                Know about coverage gaps before you need to file a claim.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-prisere-teal/10 rounded-lg p-4 mb-4">
                <Download className="h-8 w-8 text-prisere-teal mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">Share with Broker</h3>
              <p className="text-gray-600 text-sm">
                Download reports to discuss specific changes with your insurance broker.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-prisere-dark-gray mb-8" 
              style={{ fontFamily: 'var(--font-heading)' }}>
            Ready to Understand Your Renewal?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Get a clear analysis of your insurance renewal changes in minutes, not hours.
          </p>
          <div className="flex justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-prisere-maroon hover:bg-prisere-maroon/90 text-lg px-8 py-6">
                Start Your Free Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-100 text-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Logo className="mb-4" />
              <p className="text-gray-600 text-sm">
                Helping small business owners understand their insurance renewals with AI-powered analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/sign-up" className="hover:text-prisere-maroon">Get Started</Link></li>
                <li><Link href="#how-it-works" className="hover:text-prisere-maroon">How It Works</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-prisere-maroon">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-prisere-maroon">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 Prisere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}