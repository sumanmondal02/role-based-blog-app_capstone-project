import { NavLink } from "react-router";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-[#e8e8ed] mt-10 bg-white">
            <div className="max-w-5xl mx-auto px-2 py-10">
                <div className="flex flex-col sm:flex-row justify-between gap-8">
                    
                    {/* Brand */}
                    <div>
                        <p className="text-base font-semibold text-[#1d1d1f] tracking-tight mb-1">
                            MyBlog
                        </p>
                        <p className="text-sm text-[#6e6e73] max-w-xs">
                            A space for writers and readers. Share ideas, read stories, leave your thoughts.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex gap-12">
                        <div>
                            <p className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-widest mb-3">
                                Navigate
                            </p>
                            <div className="flex flex-col gap-2">
                                <NavLink to="/" className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                                    Home
                                </NavLink>
                                <NavLink to="/register" className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                                    Register
                                </NavLink>
                                <NavLink to="/login" className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                                    Login
                                </NavLink>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-widest mb-3">
                                For Authors
                            </p>
                            <div className="flex flex-col gap-2">
                                <NavLink to="/register" className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                                    Start Writing
                                </NavLink>
                                <NavLink to="/author-profile" className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                                    My Articles
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-[#e8e8ed] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-[#a1a1a6]">
                        © {currentYear} MyBlog. All rights reserved.
                    </p>
                    <p className="text-xs text-[#a1a1a6]">
                        Made with care for writers everywhere
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;