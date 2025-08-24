import React, { useEffect, useState } from 'react'
import { Select } from "@/components/retroui/Select";
import { Text } from '../retroui/Text';

type VideoState = {
    gotPermissions: boolean;
    cameraStarted: boolean;
    numberOfDevices: number;
    errorMessage: string | null;
};

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
        if (allVideoDeviceObjects.length > 0 && initializedCameraId === false) {
            setCurrentCamera(allVideoDeviceObjects[0].deviceId)
            setInitializedCameraId(true);
        }
    }, [videoState])
    
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
                        {/* <h4 className="text-center mb-2">All available cameras</h4> */}
                        <Select value={currentCameraId ?? undefined} onValueChange={changeCameraId}>
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
                                                    title={item.label || item.deviceId} // Full text as tooltip
                                                >
                                                    {displayName}
                                                </Select.Item>
                                            )
                                        })
                                    }
                                </Select.Group>
                            </Select.Content>
                        </Select>
                    </div>
            }
        </div>
    )
}

export default AllVideoDevicesDropdown