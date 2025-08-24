import React, { useEffect, useState } from 'react'
import { Select } from "@/components/retroui/Select";
import { Text } from '../retroui/Text';
import { VideoState } from '@/lib/types';

type Props = {
    videoState: VideoState;
    allVideoDeviceObjects: MediaDeviceInfo[];
    setCurrentCamera: (deviceId: string) => void;
    currentCameraId: string | null;
};

const AllVideoDevicesDropdown: React.FC<Props> = ({ videoState, allVideoDeviceObjects, setCurrentCamera, currentCameraId }) => {
    const [initializedCameraId, setInitializedCameraId] = useState(false)

    function changeCameraId(value: string) {
        setCurrentCamera(value)
    }

    useEffect(() => {
        // Initialize selected camera once when devices are available and none is selected yet.
        if (!initializedCameraId && !currentCameraId && allVideoDeviceObjects.length > 0) {
            setCurrentCamera(allVideoDeviceObjects[0].deviceId)
            setInitializedCameraId(true);
        }
    }, [initializedCameraId, currentCameraId, allVideoDeviceObjects, setCurrentCamera])
    
    // Function to format device name for better display
    const formatDeviceName = (label: string, deviceId: string): string => {
        if (!label) return `Camera (${deviceId.substring(0, 8)}...)`;
        
        // Some device labels can be very long, especially on mobile
        // Format them to be more readable
        if (label.length > 30) {
            // Extract meaningful parts if possible
            if (label.includes(" - ")) {
                const parts = label.split(" - ");
                return parts[parts.length - 1];
            }
            return label.substring(0, 30) + "...";
        }
        return label;
    }
    
    return (
        <div className="w-full">
            {
                (videoState.gotPermissions === false) ?
                    <Text as="h4" className="text-center">Yet to get camera permissions</Text>
                    :
                    <div className="w-full">
                        <Text as="h4" className="text-center mb-2">All available cameras</Text>
                        {
                            // Render Select only when we have a selected camera ID,
                            // keeping it controlled for its entire lifecycle.
                            currentCameraId ? (
                                <Select value={currentCameraId} onValueChange={changeCameraId}>
                                    <Select.Trigger className="w-full">
                                        <Select.Value placeholder="Select a camera" className="truncate max-w-[200px]" />
                                    </Select.Trigger>
                                    <Select.Content>
                                        <Select.Group>
                                            {
                                                allVideoDeviceObjects.map((item: MediaDeviceInfo) => {
                                                    const displayName = formatDeviceName(item.label, item.deviceId);
                                                    return (
                                                        <Select.Item 
                                                            value={item.deviceId} 
                                                            key={item.deviceId}
                                                            className="truncate"
                                                            title={item.label || item.deviceId}
                                                        >
                                                            {displayName}
                                                        </Select.Item>
                                                    )
                                                })
                                            }
                                        </Select.Group>
                                    </Select.Content>
                                </Select>
                            ) : (
                                <Text as="p" className="text-center text-sm text-muted-foreground">Detecting cameras...</Text>
                            )
                        }
                    </div>
            }
        </div>
    )
}

export default AllVideoDevicesDropdown