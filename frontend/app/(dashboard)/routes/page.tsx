"use client";
import { ResourcePage } from "@/components/resource-page";
import type { Route } from "@/lib/types";
export default function Page(){return <ResourcePage<Route> title="Routes" description="Define reusable origin-to-destination route plans." endpoint="/routes" fields={[{name:"name",label:"Route name",required:true},{name:"origin",label:"Origin",required:true},{name:"destination",label:"Destination",required:true},{name:"distanceKm",label:"Distance (km)",type:"number"},{name:"estimatedMinutes",label:"Estimated minutes",type:"number"}]} columns={[{key:"name",label:"Name"},{key:"origin",label:"Origin"},{key:"destination",label:"Destination"},{key:"distanceKm",label:"Distance (km)"},{key:"estimatedMinutes",label:"ETA (minutes)"}]}/>}
