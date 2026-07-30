"use client";
import { ResourcePage } from "@/components/resource-page";
import type { Customer } from "@/lib/types";
export default function Page(){return <ResourcePage<Customer> title="Customers" description="Manage delivery recipients and business accounts." endpoint="/customers" fields={[{name:"name",label:"Name",required:true},{name:"email",label:"Email",type:"email"},{name:"phone",label:"Phone"},{name:"address",label:"Address",required:true},{name:"city",label:"City",required:true},{name:"state",label:"State"},{name:"country",label:"Country",required:true},{name:"postalCode",label:"Postal code"}]} columns={[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"phone",label:"Phone"},{key:"city",label:"City"},{key:"country",label:"Country"}]}/>}
