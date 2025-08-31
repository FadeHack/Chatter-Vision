import { Link } from "react-router-dom"
import { Video, Users, Shield, Globe2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import ShimmerButton from "@/components/ui/shimmer-button"
import { useRef } from "react"
import { AnimatedBeam } from "@/components/ui/animated-beam"

function Home() {
    // Add refs for the beam connections
    const containerRef = useRef(null)
    const centerRef = useRef(null)
    const topLeftRef = useRef(null)
    const topRightRef = useRef(null)
    const bottomLeftRef = useRef(null)
    const bottomRightRef = useRef(null)

    return (
        <div className="flex flex-col">
            {/* Combined Hero and Animation Section */}
            <section className="min-h-[600px] px-4 py-20 md:py-24 relative bg-gradient-to-b from-background to-muted">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Hero Content - Left Side */}
                        <div className="flex flex-col gap-8">
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                                Connect, Collaborate, <br />
                                <span className="text-primary">Communicate</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-[600px]">
                                High-quality video conferencing for teams of all sizes. Simple, reliable, and secure.
                            </p>
                            <div className="flex gap-4">
                                <Link to="/register">
                                    <ShimmerButton>Get Started Free</ShimmerButton>
                                </Link>
                                <Link to="/features">
                                    <Button variant="outline" size="lg">See Features</Button>
                                </Link>
                            </div>
                        </div>

                        {/* Animation Section - Right Side */}
                        <div className="relative h-[500px] md:h-[600px] rounded-2xl">
                            <div ref={containerRef} className="absolute inset-0">
                                {/* Center point (main user) */}
                                <div 
                                    ref={centerRef}
                                    className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary transition-transform hover:scale-110"
                                >
                                    <Video className="w-10 h-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground" />
                                </div>
                                
                                {/* Corner points (other users) */}
                                <div ref={topLeftRef} className="absolute left-[20%] top-[20%] z-10 w-16 h-16 rounded-full bg-primary transition-transform hover:scale-110">
                                    <Users className="w-8 h-8  absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground" />
                                </div>
                                <div ref={topRightRef} className="absolute right-[20%] top-[20%] z-10 w-16 h-16 rounded-full bg-primary transition-transform hover:scale-110">
                                    <Users className="w-8 h-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground" />
                                </div>
                                <div ref={bottomLeftRef} className="absolute left-[20%] bottom-[20%] z-10 w-16 h-16 rounded-full bg-primary transition-transform hover:scale-110">
                                    <Users className="w-8 h-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground" />
                                </div>
                                <div ref={bottomRightRef} className="absolute right-[20%] bottom-[20%] z-10 w-16 h-16 rounded-full bg-primary transition-transform hover:scale-110">
                                    <Users className="w-8 h-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground" />
                                </div>

                                {/* Animated beams */}
                                <AnimatedBeam 
                                    containerRef={containerRef}
                                    fromRef={centerRef}
                                    toRef={topLeftRef}
                                    gradientStartColor="#22c55e"
                                    gradientStopColor="#3b82f6"
                                    pathOpacity={0.2}
                                    pathWidth={4}
                                />
                                <AnimatedBeam 
                                    containerRef={containerRef}
                                    fromRef={centerRef}
                                    toRef={topRightRef}
                                    gradientStartColor="#22c55e"
                                    gradientStopColor="#3b82f6"
                                    pathOpacity={0.2}
                                    pathWidth={4}
                                    delay={0.2}
                                />
                                <AnimatedBeam 
                                    containerRef={containerRef}
                                    fromRef={centerRef}
                                    toRef={bottomLeftRef}
                                    gradientStartColor="#22c55e"
                                    gradientStopColor="#3b82f6"
                                    pathOpacity={0.2}
                                    pathWidth={4}
                                    delay={0.2}
                                />
                                <AnimatedBeam 
                                    containerRef={containerRef}
                                    fromRef={centerRef}
                                    toRef={bottomRightRef}
                                    gradientStartColor="#22c55e"
                                    gradientStopColor="#3b82f6"
                                    pathOpacity={0.2}
                                    pathWidth={4}
                                    delay={0.2}
                                />
                            </div>

                            {/* Updated positioning for the section heading */}
                            <div className="absolute bottom-0 left-0 right-0 text-center p-1">
                                <h2 className="text-2xl font-semibold">
                                    Connect with Teams Worldwide
                                </h2>
                                <p className="text-muted-foreground mt-2">
                                    Seamless video conferencing across any distance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <Tabs defaultValue="meetings" className="w-full">
                    <div className="flex flex-col items-center gap-4 text-center mb-12">
                        <h2 className="text-3xl font-bold">Why Choose ChatterVision?</h2>
                        <p className="text-muted-foreground max-w-[600px]">
                            Discover the features that make ChatterVision the perfect choice for your team
                        </p>
                        <TabsList className="mt-4">
                            <TabsTrigger value="meetings">Meetings</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="global">Global Access</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="meetings" className="mt-4">
                        <div className="grid md:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={<Video className="w-10 h-10" />}
                                title="HD Video"
                                description="Crystal clear video quality for face-to-face interactions"
                            />
                            <FeatureCard
                                icon={<Users className="w-10 h-10" />}
                                title="Large Groups"
                                description="Host meetings with up to 100 participants"
                            />
                            <FeatureCard
                                icon={<Globe2 className="w-10 h-10" />}
                                title="Screen Sharing"
                                description="Share your screen with one click"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="security" className="mt-4">
                        <div className="grid md:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={<Shield className="w-10 h-10" />}
                                title="End-to-End Encryption"
                                description="Your conversations are always secure"
                            />
                            {/* Add more security feature cards */}
                        </div>
                    </TabsContent>

                    <TabsContent value="global" className="mt-4">
                        <div className="grid md:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={<Globe2 className="w-10 h-10" />}
                                title="Global Network"
                                description="Low-latency servers across the world"
                            />
                            {/* Add more global feature cards */}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <Card className="bg-primary-foreground text-primary">
                    <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
                        <h2 className="text-3xl font-bold">Ready to get started?</h2>
                        <p className="text-lg opacity-90 max-w-[600px]">
                            Join thousands of teams already using ChatterVision to improve their remote collaboration
                        </p>
                        <Link to="/register">
                            <Button size="lg" variant="secondary">
                                Start Free Trial
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

function FeatureCard({ icon, title, description }) {
    return (
        <Card>
            <CardHeader>
                <div className="mb-4 w-fit p-3 rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
        </Card>
    )
}

export default Home