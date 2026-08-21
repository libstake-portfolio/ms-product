import { v7 } from 'uuid';

export interface BaseMessageProps {
    causationId?: string | null;
    traceId?: string | null;
    spanId?: string | null;
}

export interface MessageMetadata {
    id: string;
    causationId: string | null;
    traceId: string | null;
    spanId: string | null;
    timestamp: number;
}

export abstract class BaseMessage {
    public readonly metadata: MessageMetadata;

    public constructor(props?: BaseMessageProps) {
        this.metadata = {
            id: v7(),
            causationId: props?.causationId ?? null,
            traceId: props?.traceId ?? null,
            spanId: props?.spanId ?? null,
            timestamp: Date.now(),
        };
    }
}
