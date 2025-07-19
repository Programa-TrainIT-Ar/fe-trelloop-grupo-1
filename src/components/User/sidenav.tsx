import Link from "next/link";
import NavLinks from "./nav-links";
import Image from "next/image";
import trainITLogo from '../../assets/logo-dark-trainit-horizontal.png';

export default function SideNav() {
    return (
        <div className="flex h-full flex-col">
            <Link className="bg-[--global-color-neutral-900] flex items-end justify-start p-4 md:h-40" href=''>
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
                <div className="hidden h-auto w-full grow bg-[--global-color-neutral-900] md:block"></div>
            </div>
        </div>
    )
}