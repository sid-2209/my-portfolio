"use client";

export default function AboutPage() {
  return (
    <div className="w-full min-h-full pb-24">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 pt-12">
        <div className="space-y-8">
          <div className="text-center space-y-6">
            <div className="space-y-6 text-left max-w-3xl mx-auto">
              <p className="michroma text-base md:text-lg lg:text-xl text-white/80 leading-relaxed">
                Welcome to my digital portfolio. I&apos;m a passionate developer and designer focused on creating
                innovative solutions that bridge technology and user experience.
              </p>

              <p className="michroma text-base md:text-lg lg:text-xl text-white/80 leading-relaxed">
                With expertise spanning blockchain development, web applications, and design systems,
                I bring ideas to life through thoughtful code and intuitive interfaces.
              </p>

              <p className="michroma text-base md:text-lg lg:text-xl text-white/80 leading-relaxed">
                My work focuses on building scalable, accessible, and performant applications that
                solve real-world problems while maintaining exceptional attention to detail.
              </p>

              <div className="pt-8">
                <h2 className="michroma text-2xl md:text-3xl font-semibold text-white mb-4">
                  Expertise
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="michroma text-lg md:text-xl font-medium text-white">
                      Development
                    </h3>
                    <p className="michroma text-sm md:text-base text-white/70">
                      React, Next.js, TypeScript, Node.js, Blockchain
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="michroma text-lg md:text-xl font-medium text-white">
                      Design
                    </h3>
                    <p className="michroma text-sm md:text-base text-white/70">
                      UI/UX, Design Systems, Prototyping
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="michroma text-lg md:text-xl font-medium text-white">
                      Tools
                    </h3>
                    <p className="michroma text-sm md:text-base text-white/70">
                      Figma, Git, Docker, AWS, Vercel
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="michroma text-lg md:text-xl font-medium text-white">
                      Focus
                    </h3>
                    <p className="michroma text-sm md:text-base text-white/70">
                      Performance, Accessibility, User Experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}