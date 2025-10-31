import Header from "./header";

type LayoutProps = {
    children: React.ReactNode;
    center?: boolean;
};

export default function Layout({ children, center = true }: LayoutProps) {
    return (
        <div className="h-screen flex flex-col" >
            <Header />
            <div className={`flex-1 flex flex-col ${center ? "items-center justify-center" : ""}`}>
                {children}
            </div>
        </div>
    );
} 
