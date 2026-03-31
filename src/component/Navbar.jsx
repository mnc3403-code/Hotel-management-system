import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const BookIcon = () => (
     <svg className="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4" />
</svg>
)

const Navbar = () => {
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Hotels', path: '/rooms' },
        { name: 'Experiences', path: '/experiences' },
        { name: 'About', path: '/about' },
    ];

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {openSignIn} = useClerk()
    const { user } = useUser();
    const navigate= useNavigate()
    const location = useLocation();

    useEffect(() => {
    const handleScroll = () => {
        if (location.pathname !== '/') {
            setIsScrolled(true);
        } else {
            setIsScrolled(window.scrollY > 10);
        }
    };

    handleScroll(); 

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
}, [location.pathname]);


    return (
            <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 transition-all duration-700 z-50 ${isScrolled ? "bg-[#FDFBF7]/90 shadow-sm text-[#1A1A1A] backdrop-blur-xl py-4" : "py-6 bg-linear-to-b from-black/50 to-transparent"}`}>

                {/* Logo */}
                <Link to='/'>
                    <img src={assets.logo} alt="Logo" className={`h-8 md:h-10 transition-all duration-700 ${isScrolled ? "invert opacity-90" : "opacity-100"}`} />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6 lg:gap-10">
                    {navLinks.map((link, i) => (
                        <a key={i} href={link.path} className={`group flex flex-col items-center gap-1 ${isScrolled ? "text-[#1A1A1A]" : "text-white"} font-playfair tracking-[0.15em] uppercase text-xs font-semibold transition-colors`}>
                            {link.name}
                            <div className={`h-px w-0 group-hover:w-full transition-all duration-500 ${isScrolled ? "bg-[#C8A97E]" : "bg-[#C8A97E]"}`} />
                        </a>
                    ))}
                    <button className={`border px-6 py-2 text-xs tracking-[0.15em] uppercase font-semibold transition-all duration-500 ${isScrolled ? 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white' : 'border-white text-white hover:bg-white hover:text-black'}`} onClick={()=> navigate('/owner')}>
                        Dashboard
                    </button>
                </div>

                {/* Desktop Right */}
                <div className="hidden md:flex items-center gap-6">
                    <img src={assets.searchIcon} alt="Search" className={`${isScrolled  ? 'invert opacity-80' : 'opacity-100'} h-5 cursor-pointer hover:scale-110 transition-all duration-500`} />

                    {user ? (<UserButton>
                        <UserButton.MenuItems>
                            <UserButton.Action label="My bookings" labelIcon={<BookIcon/>} onClick={()=>navigate('/bookings')}/>
                            </UserButton.MenuItems>
                            </UserButton>) : (
                    <button onClick={openSignIn} className={`px-8 py-2.5 tracking-[0.15em] uppercase text-xs font-semibold transition-all duration-500 ${isScrolled ? "text-white bg-[#1A1A1A] hover:bg-[#C8A97E]" : "bg-white text-black hover:bg-[#C8A97E] hover:text-white"}`}>
                        Login
                    </button>)}

                </div>

                {/* Mobile Menu Button */}
                
                <div className="flex items-center gap-4 md:hidden">
                {user && <UserButton>
                        <UserButton.MenuItems>
                            <UserButton.Action label="My bookings" labelIcon={<BookIcon/>} onClick={()=>navigate('/bookings')}/>
                            </UserButton.MenuItems>
                            </UserButton>}

                    <img onClick={() => setIsMenuOpen(!isMenuOpen)} src={assets.menuIcon} alt="Menu" className={`${isScrolled ? "invert opacity-80" : "opacity-100"} h-5 cursor-pointer`} />
                </div>

                {/* Mobile Menu */}
                <div className={`fixed top-0 left-0 w-full h-screen bg-[#FDFBF7] flex flex-col md:hidden items-center justify-center gap-8 font-playfair tracking-[0.15em] uppercase text-[#1A1A1A] transition-all duration-700 z-50 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                    <button className="absolute top-6 right-6" onClick={() => setIsMenuOpen(false)}>
                        <img src={assets.closeIcon} alt="Close Menu" className="h-6 invert opacity-80 hover:scale-110 transition-transform"/>
                    </button>

                    {navLinks.map((link, i) => (
                        <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)} className="text-lg hover:text-[#C8A97E] transition-colors">
                            {link.name}
                        </a>
                    ))}

                  {user && 
                    <button className="border border-[#1A1A1A] px-10 py-3 text-sm font-semibold transition-all hover:bg-[#1A1A1A] hover:text-white" onClick={()=> { setIsMenuOpen(false); navigate('/owner'); }}>
                      Dashboard
                    </button>}
                   { !user && <button onClick={() => { setIsMenuOpen(false); openSignIn(); }} className="bg-[#1A1A1A] text-white px-10 py-3 text-sm font-semibold transition-all hover:bg-[#C8A97E]">
                        Login
                    </button>}
                </div>
            </nav>
      
    );
}
export default Navbar;  