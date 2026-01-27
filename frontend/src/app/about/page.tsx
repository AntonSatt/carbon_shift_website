'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Github, 
  Linkedin, 
  Globe, 
  Youtube, 
  Trophy,
  Users,
  Target,
  Lightbulb,
  Server,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const teamMembers = [
    { name: 'Anton', role: 'Team Lead' },
    { name: 'Theo', role: 'Developer' },
    { name: 'Vincent', role: 'Developer' },
    { name: 'Victoria', role: 'Developer' },
    { name: 'Mika', role: 'Developer' },
  ];

  const techStack = [
    { name: 'Grafana', color: 'bg-orange-500' },
    { name: 'AWS Bedrock', color: 'bg-yellow-500' },
    { name: 'Terraform', color: 'bg-purple-500' },
    { name: 'Python', color: 'bg-blue-500' },
    { name: 'Docker', color: 'bg-cyan-500' },
    { name: 'Next.js', color: 'bg-gray-800 dark:bg-gray-200 dark:text-gray-800' },
    { name: 'FastAPI', color: 'bg-green-600' },
  ];

  const features = [
    { icon: <Server className="h-5 w-5" />, title: 'Real-time Monitoring', description: 'Track carbon intensity across cloud regions in real-time' },
    { icon: <Lightbulb className="h-5 w-5" />, title: 'AI Recommendations', description: 'Get intelligent optimization suggestions powered by AI' },
    { icon: <Target className="h-5 w-5" />, title: 'Cost Optimization', description: 'Find the sweet spot between sustainability and budget' },
    { icon: <Leaf className="h-5 w-5" />, title: 'Carbon Tracking', description: 'Comprehensive dashboards to monitor your carbon footprint' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            <span className="text-lg sm:text-xl font-bold">CarbonShift</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Simulator</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            1st Place Winner - AWS Hackathon 2025
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            About <span className="text-green-600">CarbonShift</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            An AI-powered observability platform that empowers DevOps teams to make 
            carbon-aware deployment decisions in real-time.
          </p>
        </div>

        {/* The Challenge */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-500" />
              The Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p className="mb-4">
              The core goal of most companies is to reduce costs, but lowering the carbon footprint 
              is quickly climbing the priority list. We found that companies often aren&apos;t fully 
              aware of where their servers are hosted, leading to unnecessary costs and untracked emissions.
            </p>
            <p>
              Generally, decisions are based on server performance and cost efficiency, while often 
              ignoring sustainability. This creates a blind spot in corporate environmental responsibility.
            </p>
          </CardContent>
        </Card>

        {/* The Solution */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              The Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p className="mb-4">
              CarbonShift helps companies identify which cloud regions are cheaper and more 
              emission-efficient. By tracking carbon dioxide emissions and electricity costs 
              for servers (AWS/Azure), we empower teams to save money, boost performance, 
              and shrink their carbon footprint simultaneously.
            </p>
            <blockquote className="border-l-4 border-green-500 pl-4 italic bg-green-50 dark:bg-green-900/20 py-3 rounded-r-lg">
              &quot;Our analysis revealed that migrating a cluster of 100 m6g.xlarge instances from 
              Germany to Sweden could result in yearly savings of over <strong>10,000 kg of CO₂</strong> and <strong>$17,500</strong>. 
              This highlights how location-aware deployment strategies can drive significant 
              environmental and financial impact.&quot;
            </blockquote>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="text-green-600 mt-0.5">{feature.icon}</div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team & Event */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Team & Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Built by <strong>Team Chaos</strong> from Chas Academy. We are a group of DevOps 
              and Fullstack .NET students exploring the power of Grafana and AI.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {teamMembers.map((member, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {member.name}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              This project was developed during a hackathon hosted at <strong>HiQ HQ in Stockholm</strong>. 
              The event was sponsored by <strong>AWS</strong> and <strong>Grafana</strong>, providing the perfect 
              environment to innovate with sustainable cloud technologies.
            </p>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-purple-500" />
              Tech Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <Badge 
                  key={index} 
                  className={`${tech.color} text-white px-3 py-1`}
                >
                  {tech.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-cyan-500" />
              Project Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href="https://carbonshift.antonsatt.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <Globe className="h-5 w-5" />
                <span>Try Live Demo</span>
              </a>
              <a
                href="https://github.com/AntonSatt/carbonswift"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Github className="h-5 w-5" />
                <span>View Source Code</span>
              </a>
              <a
                href="https://www.youtube.com/watch?v=okWQFswGp1A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <Youtube className="h-5 w-5" />
                <span>Watch Demo Video</span>
              </a>
              <a
                href="https://www.linkedin.com/posts/anton-satterkvist_grafana-aws-stockholm-activity-7397530767989305344-KSw9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn Post</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* About the Creator */}
        <Card className="mb-6 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              About the Creator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Anton Sätterkvist</h3>
                <p className="text-muted-foreground mb-4">
                  DevOps student at Chas Academy with a passion for sustainable technology 
                  and cloud infrastructure optimization. Building tools that help companies 
                  reduce their environmental impact while saving costs.
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://antonsatt.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-600 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>antonsatt.com</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/anton-satterkvist/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://github.com/AntonSatt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground px-4">
        <p>© 2026 Anton Sätterkvist. Built with code & chaos. 💚</p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <a
            href="https://antonsatt.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/60 hover:text-green-600 transition-colors"
            aria-label="Personal Website"
          >
            <Globe className="h-4 w-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/anton-satterkvist/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/60 hover:text-blue-600 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/AntonSatt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </footer>
    </div>
  );
}
