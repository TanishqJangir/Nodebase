"use client"

import { formatDistanceToNow } from "date-fns";
import {
    EmptyView,
    EntityContainer,
    EntityHeader,
    EntityItem,
    EntityList,
    EntityPagination,
    ErrorView,
    LoadingView
} from "@/components/entity-components";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import type { Execution } from "@/generated/prisma";
import { ExecutionStatus } from "@/generated/prisma";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";



export const ExecutionsList = () => {
    const executions = useSuspenseExecutions();

    return (
        <EntityList
            items={executions.data.items}
            getKey={(execution) => execution.id}
            renderItem={(execution) => <ExecutionsItem data={execution} />}
            emptyView={<ExecutionsEmpty />}
        />
    )
}


export const ExecutionsHeader = () => {

    return (
        <EntityHeader
            title="Executions"
            description="View you workflow execution history"
        />
    )
};


export const ExecutionsPagination = () => {
    const executions = useSuspenseExecutions();
    const [params, setParams] = useExecutionsParams();

    return (
        <EntityPagination
            disabled={executions.isFetching}
            totalPages={executions.data.totalPages}
            page={executions.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}

export const ExecutionsContainer = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <EntityContainer
            header={<ExecutionsHeader />}
            pagination={<ExecutionsPagination />}
        >
            {children}

        </EntityContainer>
    )
}

export const ExecutionsLoading = () => {
    return <LoadingView message="Loading executions..." />
}

export const ExecutionsError = () => {
    return <ErrorView message="Error loading executions..." />
}


export const ExecutionsEmpty = () => {
    return (
        <EmptyView
            message="You haven't created any executions yet. Get started by running your first workflow."
        />
    )
}

const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return <CheckCircle2Icon className="text-green-600 size-5" />;
        case ExecutionStatus.FAILED:
            return <XCircleIcon className="text-red-600 size-5" />;
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="animate-spin text-blue-600 size-5" />;
        default:
            return <ClockIcon className="text-muted-foreground size-5" />;
    }
}



export const ExecutionsItem = ({
    data,
}: {
    data: Execution & {
        workflow: {
            id: string;
            name: string;
        }
    }
}) => {

    const duration = data.completedAt
        ? Math.round(
            (new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 1000
        )
        : null;

    const subTitle = (
        <>
            {data.workflow.name} &bull; Started{" "}
            {formatDistanceToNow(data.startedAt, { addSuffix: true })}
            {duration !== null && <> &bull; Took {duration}s</>}
        </>
    )

    return (
        <EntityItem
            href={`/executions/${data.id}`}
            title={data.status}
            subtitle={subTitle}
            image={
                <>
                    <div className="size-8 flex items-center justify-center">
                        {getStatusIcon(data.status)}
                    </div>
                </>
            }
        />
    )
}