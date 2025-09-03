import Link from "next/link";
import NavLinks from "./nav-links";
import Image from "next/image";
import trainITLogo from '../../assets/logo-dark-trainit-horizontal.png';

export default function SideNav() {
    return (
        <div className="flex h-full flex-col border-r-[1px] border-r-[--global-color-neutral-700]">
            <Link className="bg-[2B2B2B] flex items-end justify-start p-4 md:h-40" href=''>
                <div className="w-full relative h-full">
                    <Image
                        src={trainITLogo}
                        alt="TrainIt Logo"
                        fill                        
                        className="object-contain"
                    />
                </div>
            </Link>
            <div className="flex flex-grow justify-between space-x-2 md:flex-col md:space-x-0">
                <NavLinks />
                <div className="hidden h-auto w-full grow bg-[2B2B2B] md:block"></div>
            </div>
        </div>
    )
}