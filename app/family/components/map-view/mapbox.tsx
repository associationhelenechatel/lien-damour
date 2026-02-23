import { FamilyMemberWithRelations } from '@/lib/types';
import * as React from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';

export function Mapbox({ mapData }: { mapData: FamilyMemberWithRelations[] }) {

    const showMemberDetails = (member: FamilyMemberWithRelations) => {
        console.log(member);
    }
    
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        bounds: [[-5.4649, 51.8130], [10.0246, 41.2458]]
      }}
      style={{width: '100%', height: '100%'}}
      mapStyle="mapbox://styles/mapbox/streets-v11"
     
    >
        {mapData.map((member) => (
            <Marker key={member.id} longitude={parseFloat(member.longitude!)} latitude={parseFloat(member.latitude!)} color='red' onClick={() => showMemberDetails(member)} />
        ))}
    </Map>
  );
}