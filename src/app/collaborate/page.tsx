"use client";

export default function CollaboratePage() {
  return (
    <div className="w-full min-h-full pb-24">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 pt-12">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-6 text-left">
              <p className="michroma text-base md:text-lg lg:text-xl text-white/80 leading-relaxed">
                I&apos;m always interested in collaborating on exciting projects that push boundaries
                and create meaningful impact. Whether you&apos;re looking to build something new or
                improve an existing product, let&apos;s explore how we can work together.
              </p>

              <p className="michroma text-base md:text-lg lg:text-xl text-white/80 leading-relaxed">
                I specialize in full-stack development, blockchain solutions, and creating
                exceptional user experiences. From ideation to deployment, I bring technical
                expertise and creative problem-solving to every collaboration.
              </p>

              <div className="pt-8">
                <h2 className="michroma text-2xl md:text-3xl font-semibold text-white mb-4">
                  What I Can Help With
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="michroma text-lg md:text-xl font-medium text-white">
                      Web Applications
                    </h3>
                    <p className="michroma text-sm md:text-base text-white/70">
                      Building scalable, performant web apps with modern frameworks
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="michroma text-lg md:text-xl font-medium text-white">
                      Blockchain Solutions
                    </h3>
                    <p className="michroma text-sm md:text-base text-white/70">
                      Smart contracts, DApps, and Web3 integrations
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="michroma text-lg md:text-xl font-medium text-white">
                      UI/UX Design
                    </h3>
                    <p className="michroma text-sm md:text-base text-white/70">
                      Creating intuitive interfaces and seamless user experiences
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="michroma text-lg md:text-xl font-medium text-white">
                      Technical Consulting
                    </h3>
                    <p className="michroma text-sm md:text-base text-white/70">
                      Architecture planning, code reviews, and best practices
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <h2 className="michroma text-2xl md:text-3xl font-semibold text-white mb-4">
                  Get In Touch
                </h2>

                <p className="michroma text-base md:text-lg lg:text-xl text-white/80 leading-relaxed">
                  Ready to start a project? Have an idea you&apos;d like to discuss? Feel free to
                  reach out through LinkedIn or GitHub. I typically respond within 24-48 hours.
                </p>

                <div className="flex flex-wrap gap-4 mt-6">
                  <a
                    href="https://www.linkedin.com/in/realsiddhartha/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="michroma text-sm md:text-base text-white/90 hover:text-white transition-colors duration-300 underline decoration-2 underline-offset-4"
                  >
                    Connect on LinkedIn
                  </a>
                  <span className="text-white/50">•</span>
                  <a
                    href="https://github.com/sid-2209"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="michroma text-sm md:text-base text-white/90 hover:text-white transition-colors duration-300 underline decoration-2 underline-offset-4"
                  >
                    View GitHub Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
