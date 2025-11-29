import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Award, Gift, Users, Zap, Shield, Heart, ArrowRight, Sparkles, School } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              VasaBonus
            </span>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/contact")}>
              <School className="w-4 h-4 mr-2" />
              Implement at School
            </Button>
            <Button variant="ghost" onClick={() => navigate("/auth?mode=login")}>
              Log in
            </Button>
            <Button onClick={() => navigate("/auth?mode=signup")} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Get started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Star className="w-4 h-4" />
            Reward system for schools
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Motivate students with{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              points & rewards
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            VasaBonus makes it easy for teachers to give points to students for good performance. 
            Students can then use their points to purchase rewards in the class store.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-8 py-6"
            >
              Create free account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth?mode=login")}
              className="text-lg px-8 py-6"
            >
              Log in
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How does it work?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A simple system that motivates students and makes the classroom more fun
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Give points</h3>
              <p className="text-gray-600">
                Teachers give points to students for good behavior, helpfulness, 
                good work, or other positive actions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Collect points</h3>
              <p className="text-gray-600">
                Students collect their points and can see their total points, 
                history, and compare themselves with classmates.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Buy rewards</h3>
              <p className="text-gray-600">
                Students can use their points to purchase rewards 
                that the teacher has added to the class store.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* More Features */}
      <section className="bg-gradient-to-br from-purple-900 to-blue-900 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              More features
            </h2>
            <p className="text-lg text-purple-200 max-w-2xl mx-auto">
              Everything you need to create an engaging classroom
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Users className="w-10 h-10 text-purple-300 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Class management</h4>
              <p className="text-purple-200 text-sm">Create classes and invite students with a class code</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Zap className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Campaigns</h4>
              <p className="text-purple-200 text-sm">Create bonus campaigns with point multipliers</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Heart className="w-10 h-10 text-red-300 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Give gifts</h4>
              <p className="text-purple-200 text-sm">Students can give points or rewards to each other</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Shield className="w-10 h-10 text-green-300 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Tier system</h4>
              <p className="text-purple-200 text-sm">Students reach new levels and unlock customizations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Built This */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Why we built VasaBonus
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            VasaBonus started as a community project at our school, Vasa International School of Stockholm. 
            We wanted to find a fun and engaging way to spread kindness throughout our school community.
          </p>
          <p className="text-lg text-gray-600 mb-6">
            We believe that positive reinforcement can transform the classroom experience. By gamifying 
            good behavior, helpfulness, and academic achievements, we created a system where students 
            are motivated to support each other and strive for their best. It's not just about collecting 
            points — it's about building a culture of kindness, recognition, and encouragement.
          </p>
          <p className="text-lg text-gray-600">
            What started as a simple idea has grown into a tool that teachers and students love using 
            every day. We hope VasaBonus can help your classroom become a more positive and engaging 
            place for everyone!
          </p>
        </div>
      </section>

      {/* About Us */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Two friends with a passion for coding and making a difference
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Team Photo */}
            <div className="mb-12 flex justify-center">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/team-photo.jpg" 
                  alt="Nils and Parth at FIRST Global in Panama City" 
                  className="w-full max-w-2xl object-cover"
                />
                <div className="bg-white p-4 text-center">
                  <p className="text-sm text-gray-600">Team Sweden Robotics at FIRST Global 2024, Panama City</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Parth */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">P</span>
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Parth</h3>
                <p className="text-gray-600 text-center">
                  Parth combines his love for programming with his passion for badminton. 
                  A dedicated athlete and coder, he enjoys teaching programming to younger 
                  students and helping them discover the joy of building things with code.
                </p>
              </div>

              {/* Nils */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">N</span>
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Nils</h3>
                <p className="text-gray-600 text-center">
                  Nils is passionate about technology and creativity. When he's not coding, 
                  you can find him doing photo editing and working on visual projects. 
                  He loves teaching programming to younger students and inspiring the next 
                  generation of developers.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-md">
                <Heart className="w-6 h-6 text-red-500" />
                <p className="text-gray-700">
                  <span className="font-semibold">Friends since first grade</span> — We've been 
                  building projects together for years, including competing at <span className="font-semibold">FIRST Global</span>, 
                  an international robotics competition in Panama City.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Create a free account today and start motivating your students with VasaBonus.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth?mode=signup")}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-10 py-6"
          >
            Create free account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VasaBonus</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm">
                Created by students at Vasa International School of Stockholm
              </p>
              <p className="text-sm mt-1">
                © {new Date().getFullYear()} VasaBonus. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
