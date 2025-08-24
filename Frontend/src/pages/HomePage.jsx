import React from 'react'
import { useUser } from '../context/UserContext';
import {Sidebar,SidebarBody,SidebarLink} from '@/components/ui/sidebar';
import { IconHome, IconUser, IconSettings } from "@tabler/icons-react";

const HomePage = () => {
  const { user } = useUser();
  const links = [
    { href: "/dashboard", icon: <IconHome />, label: "Dashboard" },
    { href: "/profile", icon: <IconUser />, label: "Profile" },
    { href: "/settings", icon: <IconSettings />, label: "Settings" },
  ];
  console.log("From home",user);

  return (
    <div>
      <Sidebar>
        <SidebarBody>
          {links.map((link) => (
            <SidebarLink key={link.href} link={link} />
          ))}
        </SidebarBody>
       
      </Sidebar>
    </div>
  )
}

export default HomePage
